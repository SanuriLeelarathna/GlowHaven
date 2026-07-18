import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
    name: string;
    description: string;
    image?: string;
    status: boolean;
}

const CategorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        image: {
            type: String,
            default: "",
        },

        status: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ICategory>("Category", CategorySchema);