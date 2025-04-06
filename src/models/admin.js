import mongoose, { Schema, model } from "mongoose";

const schema = new Schema(
    {
        name: { type: String, required: [true, "Please enter name"] },
        email: {
            type: String,
            required: [true, "Please enter email"],
            unique: true,
        },
        role: { type: String, enum: ["admin", "user"] },
    },
    { timestamps: true }
);

export const User = mongoose.models.User || model("User", schema);
