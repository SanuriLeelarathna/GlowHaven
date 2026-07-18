import mongoose, { Document, Schema } from "mongoose";

export interface IService extends Document {
  name: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
  category?: mongoose.Types.ObjectId;
}

const serviceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  {
    timestamps: true,
  }
);

const Service =
  mongoose.models.Service || mongoose.model<IService>("Service", serviceSchema);

export default Service;