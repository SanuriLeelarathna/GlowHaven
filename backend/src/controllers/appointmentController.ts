import { Request, Response } from "express";
import Appointment from "../models/Appointment";
import Service from "../models/service";
import transporter from "../config/email";

// "13:00" or "13.00" -> minutes
const timeToMinutes = (time: string): number => {
  const normalizedTime = time.replace(".", ":");
  const [hours, minutes] = normalizedTime.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new Error("Invalid time format");
  }

  return hours * 60 + minutes;
};

// Check time range overlap
// Example:
// existing: 13:00 - 13:45
// new:      13:30 - 14:15
// overlap = true
const isTimeOverlapping = (
  newStart: number,
  newEnd: number,
  existingStart: number,
  existingEnd: number
): boolean => {
  return newStart < existingEnd && newEnd > existingStart;
};

export const updatePassedAppointments = async (): Promise<void> => {
  try {
    const now = new Date();
    // We only care about appointments that are "pending" or "confirmed" (i.e. upcoming)
    const upcomingAppointments = await Appointment.find({
      status: { $in: ["pending", "confirmed"] },
    });

    for (const app of upcomingAppointments) {
      if (!app.date || !app.time) continue;

      const [year, month, day] = app.date.split("-").map(Number);
      const [hours, minutes] = app.time.split(":").map(Number);

      if (
        Number.isNaN(year) ||
        Number.isNaN(month) ||
        Number.isNaN(day) ||
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
      ) {
        continue;
      }

      const startTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
      const endTime = new Date(startTime.getTime() + app.duration * 60 * 1000);

      if (now > endTime) {
        app.status = "completed";
        await app.save();
        console.log(`Automatically completed appointment ${app._id} scheduled for ${app.date} ${app.time}`);
      }
    }
  } catch (error) {
    console.error("Error in updatePassedAppointments status updater:", error);
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { customerId, serviceId, staffId, date, time } = req.body;

    if (!customerId || !serviceId || !staffId || !date || !time) {
      return res.status(400).json({
        message: "customerId, serviceId, staffId, date and time are required",
      });
    }

    // Run status update before checking availability/overlap and creating the booking
    await updatePassedAppointments();

    const normalizedTime = time.replace(".", ":");

    // Validate proposed date & time is not in the past relative to the server time
    const now = new Date();
    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = normalizedTime.split(":").map(Number);

    if (
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      Number.isNaN(day) ||
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      return res.status(400).json({ message: "Invalid date or time format" });
    }

    const proposedStart = new Date(year, month - 1, day, hours, minutes, 0, 0);
    if (proposedStart < now) {
      return res.status(400).json({
        message: "Cannot book an appointment in the past.",
      });
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const newStart = timeToMinutes(normalizedTime);
    const newEnd = newStart + service.duration;

    // Get all appointments for same staff and same date that are NOT cancelled or completed
    const existingAppointments = await Appointment.find({
      staffId,
      date,
      status: { $nin: ["cancelled", "completed"] },
    }).populate("serviceId", "duration");

    for (const existingAppointment of existingAppointments) {
      const existingStart = timeToMinutes(existingAppointment.time);

      const existingDuration =
        existingAppointment.duration ||
        (existingAppointment.serviceId as any)?.duration;

      if (!existingDuration) {
        console.log("Existing appointment duration missing:", existingAppointment);
        continue;
      }

      const existingEnd = existingStart + existingDuration;

      console.log("Overlap check:", {
        newTime: normalizedTime,
        newStart,
        newEnd,
        existingTime: existingAppointment.time,
        existingStart,
        existingEnd,
        existingDuration,
      });

      if (isTimeOverlapping(newStart, newEnd, existingStart, existingEnd)) {
        return res.status(400).json({
          message:
            "This staff member is not available. The selected time overlaps with another appointment.",
        });
      }
    }

    const appointment = await Appointment.create({
      customerId,
      serviceId,
      staffId,
      date,
      time: normalizedTime,
      duration: service.duration,
      amount: service.price,
      status: "pending",
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("customerId", "name email phone")
      .populate("serviceId", "name price duration")
      .populate("staffId", "name email phone specialization");

    return res.status(201).json({
      message: "Appointment booked successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.log("Create appointment error:", error);
    return res.status(500).json({
      message: "Appointment booking failed",
      error,
    });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    // Run status update before retrieving list
    await updatePassedAppointments();

    const appointments = await Appointment.find()
      .populate("customerId", "name email phone")
      .populate("serviceId", "name price duration")
      .populate("staffId", "name email phone specialization")
      .sort({ date: -1, time: -1 });

    return res.status(200).json({
      message: "Appointments fetched successfully",
      appointments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch appointments",
      error,
    });
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    await updatePassedAppointments();

    const appointment = await Appointment.findById(req.params.id)
      .populate("customerId", "name email phone")
      .populate("serviceId", "name price duration")
      .populate("staffId", "name email phone specialization");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    return res.status(200).json({
      message: "Appointment fetched successfully",
      appointment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch appointment",
      error,
    });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    await updatePassedAppointments();

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("customerId", "name email phone")
      .populate("serviceId", "name price duration")
      .populate("staffId", "name email phone specialization");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }


    // Send confirmation email when admin confirms appointment
    if (status === "confirmed") {

      const customer = appointment.customerId as any;
      const service = appointment.serviceId as any;
      const staff = appointment.staffId as any;


      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: customer.email,
        subject: "Salon Appointment Confirmed ✅",
        html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Appointment Confirmation</title>
</head>

<body style="margin:0; padding:0; background:#f4eef1; font-family:Arial, Helvetica, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding:40px 20px;">

<table width="600" cellpadding="0" cellspacing="0" border="0" style="
background:#ffffff;
border-radius:18px;
overflow:hidden;
box-shadow:0 20px 50px rgba(143,49,88,0.15);
">

<!-- Header -->
<tr>
<td style="
background:#11120D;
padding:40px 30px 34px;
text-align:center;
">

<p style="
color:#d96b9b;
margin:0 0 10px;
font-size:11px;
letter-spacing:4px;
text-transform:uppercase;
font-weight:bold;
">
GlowHaven
</p>

<h1 style="
color:#ffffff;
margin:0;
font-size:30px;
letter-spacing:2px;
font-weight:600;
">
YOUR SALON
</h1>

<p style="
color:#a08d95;
margin:12px 0 0;
font-size:13px;
letter-spacing:1px;
">
Luxury Beauty Experience
</p>

</td>
</tr>


<!-- Accent divider -->
<tr>
<td style="height:4px; background:linear-gradient(90deg,#8f3158,#d96b9b);"></td>
</tr>


<!-- Content -->
<tr>
<td style="
padding:40px 40px 10px;
color:#262020;
">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:25px;">
<tr>
<td align="center">
<span style="
display:inline-block;
background:#f8dce8;
color:#8f3158;
font-size:11px;
font-weight:bold;
letter-spacing:2px;
text-transform:uppercase;
padding:8px 20px;
border-radius:30px;
">
&#10003; Appointment Confirmed
</span>
</td>
</tr>
</table>

<h2 style="
color:#11120D;
text-align:center;
font-size:24px;
font-weight:600;
margin:0 0 25px;
">
We can't wait to see you ✨
</h2>

<p style="font-size:15px; line-height:1.7; color:#443b3e;">
Hello <b style="color:#8f3158;">${customer.name}</b>,
</p>

<p style="font-size:15px; line-height:1.7; color:#443b3e;">
Your appointment has been confirmed successfully. We're excited to
welcome you and provide a premium salon experience crafted just for you.
</p>


<!-- Booking Card -->

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="
background:#fdf3f6;
border:1px solid #f3d8e2;
border-radius:14px;
margin-top:20px;
">

<tr>
<td colspan="2" style="
padding:16px 24px 10px;
font-size:11px;
letter-spacing:2px;
text-transform:uppercase;
color:#8f3158;
font-weight:bold;
border-bottom:1px solid #f3d8e2;
">
Booking Details
</td>
</tr>

<tr>
<td style="padding:14px 24px 0; font-size:14px; color:#7c7272;">Service</td>
<td style="padding:14px 24px 0; text-align:right; font-size:14px; color:#11120D; font-weight:bold;">${service.name}</td>
</tr>

<tr>
<td style="padding:10px 24px 0; font-size:14px; color:#7c7272;">Professional</td>
<td style="padding:10px 24px 0; text-align:right; font-size:14px; color:#11120D; font-weight:bold;">${staff.name}</td>
</tr>

<tr>
<td style="padding:10px 24px 0; font-size:14px; color:#7c7272;">Date</td>
<td style="padding:10px 24px 0; text-align:right; font-size:14px; color:#11120D; font-weight:bold;">${appointment.date}</td>
</tr>

<tr>
<td style="padding:10px 24px 0; font-size:14px; color:#7c7272;">Time</td>
<td style="padding:10px 24px 0; text-align:right; font-size:14px; color:#11120D; font-weight:bold;">${appointment.time}</td>
</tr>

<tr>
<td colspan="2" style="padding:16px 24px 0;">
<div style="height:1px; background:#f3d8e2;"></div>
</td>
</tr>

<tr>
<td style="padding:14px 24px 20px; font-size:15px; color:#11120D; font-weight:bold;">Total Amount</td>
<td style="
padding:14px 24px 20px;
text-align:right;
color:#8f3158;
font-size:20px;
font-weight:bold;
">
LKR ${appointment.amount}
</td>
</tr>

</table>


<!-- CTA button -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px;">
<tr>
<td align="center">
<a href="#" style="
display:inline-block;
background:linear-gradient(135deg,#8f3158,#d96b9b);
background-color:#8f3158;
color:#ffffff;
font-size:13px;
font-weight:bold;
letter-spacing:1.5px;
text-transform:uppercase;
text-decoration:none;
padding:14px 38px;
border-radius:30px;
">
View My Booking
</a>
</td>
</tr>
</table>


<p style="
margin:32px 0 10px;
text-align:center;
font-size:14px;
color:#443b3e;
">
Thank you for choosing <b style="color:#8f3158;">GlowHaven</b>.
</p>

<p style="
margin:0 0 30px;
text-align:center;
font-size:12.5px;
color:#9c8890;
">
Need to reschedule or have a question? Just reply to this email &mdash; we're happy to help.
</p>

</td>
</tr>


<!-- Footer -->

<tr>
<td style="
background:#11120D;
padding:26px 30px;
text-align:center;
">

<p style="
color:#d96b9b;
font-size:12px;
letter-spacing:2px;
text-transform:uppercase;
margin:0 0 8px;
font-weight:bold;
">
GlowHaven
</p>

<p style="
color:#8a7f83;
font-size:12.5px;
margin:0;
">
&copy; 2026 Your Salon. All Rights Reserved.
</p>

</td>
</tr>


</table>

</td>
</tr>
</table>

</body>
</html>
`
      });

      console.log("Confirmation email sent to:", customer.email);
    }


    return res.status(200).json({
      message: "Appointment status updated successfully",
      appointment,
    });

  } catch (error) {
    console.log("Appointment status update failed:", error);

    return res.status(500).json({
      message: "Appointment status update failed",
      error,
    });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    return res.status(200).json({
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Appointment delete failed",
      error,
    });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { customerId, serviceId, staffId, date, time, duration, amount, status } = req.body;
    const { id } = req.params;

    // Run status update before checking constraints
    await updatePassedAppointments();

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    let resolvedDuration = duration;
    let resolvedAmount = amount;

    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      if (duration === undefined) resolvedDuration = service.duration;
      if (amount === undefined) resolvedAmount = service.price;
    } else {
      if (duration === undefined) resolvedDuration = appointment.duration;
      if (amount === undefined) resolvedAmount = appointment.amount;
    }

    const checkStaffId = staffId || appointment.staffId;
    const checkDate = date || appointment.date;
    const checkTime = time || appointment.time;

    if (checkStaffId && checkDate && checkTime) {
      const normalizedTime = checkTime.replace(".", ":");
      const newStart = timeToMinutes(normalizedTime);
      const newEnd = newStart + resolvedDuration;

      const existingAppointments = await Appointment.find({
        _id: { $ne: id },
        staffId: checkStaffId,
        date: checkDate,
        status: { $nin: ["cancelled", "completed"] },
      }).populate("serviceId", "duration");

      for (const existingAppointment of existingAppointments) {
        const existingStart = timeToMinutes(existingAppointment.time);
        const existingDuration =
          existingAppointment.duration ||
          (existingAppointment.serviceId as any)?.duration;

        if (!existingDuration) continue;
        const existingEnd = existingStart + existingDuration;

        if (isTimeOverlapping(newStart, newEnd, existingStart, existingEnd)) {
          return res.status(400).json({
            message: "This staff member is not available. The selected time overlaps with another appointment.",
          });
        }
      }
    }

    if (customerId) appointment.customerId = customerId;
    if (serviceId) appointment.serviceId = serviceId;
    if (staffId) appointment.staffId = staffId;
    if (date) appointment.date = date;
    if (time) appointment.time = time.replace(".", ":");
    if (status) appointment.status = status;
    if (resolvedDuration !== undefined) appointment.duration = resolvedDuration;
    if (resolvedAmount !== undefined) appointment.amount = resolvedAmount;

    await appointment.save();

    const populated = await Appointment.findById(id)
      .populate("customerId", "name email phone")
      .populate("serviceId", "name price duration")
      .populate("staffId", "name email phone specialization");

    return res.status(200).json({
      message: "Appointment updated successfully",
      appointment: populated,
    });
  } catch (error) {
    console.log("Update appointment error:", error);
    return res.status(500).json({
      message: "Failed to update appointment",
      error,
    });
  }
};