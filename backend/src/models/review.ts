import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
    name: string;
    rating: number;
    comment: string;
    status: "pending" | "approved";
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        comment: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["pending", "approved"],
            default: "pending", // Admin approve කරනකන් Home page එකේ පෙන්නන්නේ නෑ
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IReview>("Review", reviewSchema);