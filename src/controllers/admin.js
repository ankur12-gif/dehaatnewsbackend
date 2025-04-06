import { TryCatch } from "../middleware/error.js";
import { User } from "../models/admin.js";
import { AdminPassKey } from "../../app.js";
import bcrypt from "bcrypt";

const createUser = TryCatch(async (req, res) => {
    const { name, email } = req.body;

    const createdUser = await User.create({ name, email, role: "user" });

    return res.status(200).json({ success: true, createdUser });
});

const loginUser = TryCatch(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new Error("Please Enter Credentials ", 404));
    }

    const admin = await User.findOne({ email });

    const isMatch = await bcrypt.compare(password, AdminPassKey);
    if (!isMatch || !admin) return next(new Error("You are not allowed", 404));

    return res.status(200).json({ success: true, admin });
});

export { createUser, loginUser };
