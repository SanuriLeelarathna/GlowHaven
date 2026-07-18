import cron from "node-cron";
import Appointment from "../models/Appointment";
import transporter from "../config/email";


// Run every day at 5:30 PM
cron.schedule("33 17 * * *", async () => {

    try {
        console.log("Checking tomorrow confirmed appointments...");


        // Get tomorrow date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const tomorrowDate = tomorrow.toISOString().split("T")[0];


        // Get only confirmed appointments
        const appointments = await Appointment.find({
            date: tomorrowDate,
            status: "confirmed"
        })
            .populate("staffId")
            .populate("serviceId")
            .populate("customerId");


        if (appointments.length === 0) {
            console.log("No confirmed appointments for tomorrow.");
            return;
        }


        // Group appointments by staff member
        const staffSchedules: any = {};


        appointments.forEach((appointment: any) => {

            const staff = appointment.staffId;


            if (!staffSchedules[staff._id]) {

                staffSchedules[staff._id] = {
                    name: staff.name,
                    email: staff.email,
                    appointments: []
                };

            }


            staffSchedules[staff._id].appointments.push({

                time: appointment.time,
                customer: appointment.customerId.name,
                service: appointment.serviceId.name,
                duration: appointment.duration

            });

        });



        // Send email to each staff member
        for (const staffId in staffSchedules) {

            const staff = staffSchedules[staffId];


            let scheduleDetails = "";


            staff.appointments.forEach((appointment: any) => {

                scheduleDetails += `

                <div style="
                    margin-bottom:20px;
                    padding:15px;
                    border:1px solid #ddd;
                    border-radius:10px;
                ">

                    <h3>
                        ${appointment.time}
                    </h3>

                    <p>
                        <b>Customer:</b> ${appointment.customer}
                    </p>

                    <p>
                        <b>Service:</b> ${appointment.service}
                    </p>

                    <p>
                        <b>Duration:</b> ${appointment.duration} minutes
                    </p>

                </div>

                `;

            });



            await transporter.sendMail({

                from: process.env.EMAIL_USER,

                to: staff.email,

                subject:
                    "Tomorrow's Appointment Schedule - GlowHaven Salon",


                html: `

                <div style="
                    font-family: Arial, sans-serif;
                ">

                    <h2>
                        Hello ${staff.name},
                    </h2>


                    <p>
                        Here is your confirmed appointment schedule for tomorrow.
                    </p>


                    <h3>
                        Date: ${tomorrowDate}
                    </h3>


                    ${scheduleDetails}


                    <p>
                        Please arrive before your first appointment.
                    </p>


                    <br>


                    <strong>
                        GlowHaven Salon
                    </strong>

                </div>

                `

            });



            console.log(
                `Schedule email sent to ${staff.email}`
            );

        }


    } catch (error) {

        console.log(
            "Staff schedule email error:",
            error
        );

    }

});