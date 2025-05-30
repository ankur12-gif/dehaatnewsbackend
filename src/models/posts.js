import mongoose, { Schema, model } from "mongoose";

const schema = new Schema(
    {
        title: { type: String, required: [true, "Please enter title"] },
        description: { type: String, required: [true, "Please enter description"] },
        category: {
            type: String,
            required: [true, "Please enter category"],
            enum: ["crime", "health", "sports", "story", "farming", "general"],
        },
        photos: [
            {
                public_id: { type: String, required: [true, "Please enter public_id"] },
                url: { type: String, required: [true, "Please enter url"] },
            },
        ],
    },
    { timestamps: true }
);

export const Posts = mongoose.models.Posts || model("Posts", schema);
