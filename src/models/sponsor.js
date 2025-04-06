import mongoose, { Schema, model } from "mongoose";

const schema = new Schema(
    {
        name: { type: String, required: [true, "Please enter title"] },
        photos: [
            {
                public_id: { type: String, required: [true, "Please enter public_id"] },
                url: { type: String, required: [true, "Please enter url"] },
            },
        ],
    },
    { timestamps: true }
);

export const Sponsors = mongoose.models.Sponsors || model("Sponsors", schema);
