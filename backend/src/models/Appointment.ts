import mongoose, { Document, Schema } from "mongoose";

export interface IAppointment extends Document {
  customerId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  staffId: mongoose.Types.ObjectId;
  date: string;
  time: string;
  duration: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  amount: number;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    staffId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema
);

export default Appointment;