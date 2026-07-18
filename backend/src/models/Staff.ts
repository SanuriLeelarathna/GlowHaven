import mongoose, { Document, Schema } from "mongoose";

export interface IStaff extends Document {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  image?: string;
  services: mongoose.Types.ObjectId[];
  workingHours: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
}

const staffSchema = new Schema<IStaff>(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
    },

    specialization: {
      type: String,
      required: true,
    },

    image: {
      type: String,
    },

    services: [
      {
        type: Schema.Types.ObjectId,
        ref: "Service",
      },
    ],

    workingHours: [
      {
        day: {
          type: String,
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStaff>("Staff", staffSchema);