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
<title>Appointment Confirmation</title>
</head>

<body style="margin:0; padding:0; background:#11120D; font-family:Arial, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:40px 20px;">

<table width="600" style="
background:white;
border-radius:15px;
overflow:hidden;
">

<!-- Header -->
<tr>
<td style="
background:#11120D;
padding:30px;
text-align:center;
">

<h1 style="
color:#D4AF37;
margin:0;
font-size:32px;
letter-spacing:2px;
">
YOUR SALON
</h1>

<p style="
color:#D8CFBC;
margin-top:10px;
font-size:14px;
">
Luxury Beauty Experience
</p>

</td>
</tr>


<!-- Content -->
<tr>
<td style="
padding:35px;
color:#11120D;
">

<h2 style="
color:#11120D;
text-align:center;
">
Appointment Confirmed ✨
</h2>


<p>
Hello <b>${customer.name}</b>,
</p>

<p>
Your appointment has been confirmed successfully.
We are excited to welcome you and provide a premium salon experience.
</p>


<!-- Booking Card -->

<table width="100%" style="
background:#D8CFBC;
border-radius:12px;
padding:20px;
margin-top:25px;
">

<tr>
<td style="padding:8px;">
<b>Service</b>
</td>

<td style="padding:8px; text-align:right;">
${service.name}
</td>
</tr>


<tr>
<td style="padding:8px;">
<b>Professional</b>
</td>

<td style="padding:8px; text-align:right;">
${staff.name}
</td>
</tr>


<tr>
<td style="padding:8px;">
<b>Date</b>
</td>

<td style="padding:8px; text-align:right;">
${appointment.date}
</td>
</tr>


<tr>
<td style="padding:8px;">
<b>Time</b>
</td>

<td style="padding:8px; text-align:right;">
${appointment.time}
</td>
</tr>


<tr>
<td style="padding:8px;">
<b>Amount</b>
</td>

<td style="
padding:8px;
text-align:right;
color:#B8860B;
font-weight:bold;
">
LKR ${appointment.amount}
</td>
</tr>


</table>


<p style="
margin-top:30px;
text-align:center;
">
Thank you for choosing <b>YOUR SALON</b>.
</p>


</td>
</tr>


<!-- Footer -->

<tr>
<td style="
background:#11120D;
padding:20px;
text-align:center;
">

<p style="
color:#D8CFBC;
font-size:13px;
margin:0;
">
© 2026 Your Salon. All Rights Reserved.
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