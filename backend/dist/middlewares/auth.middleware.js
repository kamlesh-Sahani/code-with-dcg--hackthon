import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import companyModel from "../models/company.model.js";
import dbConnect from "../utils/dbConnect.js";
export const authMiddleware = async (req, res, next) => {
    try {
        await dbConnect();
        /**
         * eg. headers:{
         * authorization:bearer kjhhskfsdfdf(token)
         * }
         *
         */
        const token = req.headers.authorization?.split(" ")[1] || req.cookies["auth-token"];
        if (!token) {
            return res.status(401).json({
                message: "unauthorized",
                success: false
            });
        }
        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);
        console.log(decoded, "decoded");
        if (decoded.role === "user") {
            const user = await userModel.findById(decoded._id);
            console.log(user, "user");
            req.user = user;
        }
        else {
            const company = await companyModel.findById(decoded._id);
            req.company = company;
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            message: error.message || "internal error",
            success: false
        });
    }
};
