import { User } from "../models/admin.js";
import { TryCatch } from "./error.js";

export const adminOnly = TryCatch(async (req, res, next) => {
    const { id } = req.query;

    if (!id) retun(new Error("Login at First", 200));

    const user = await User.findById(id);
    if (!user) return next(new Error("You are not allowed", 401));

    next();
});
