import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import companyModel from "../models/company.model.js";
import ErrorHandler from "../utils/errorHandler.js";
import dbConnect from "../utils/dbConnect.js";
const cookieOption = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
};
export const newCompany = asyncHandler(async (req, res, next) => {
    try {
        await dbConnect();
        const { companyName, adminEmail, adminName, address, password } = req.body;
        if (!companyName || !adminEmail || !adminName || !password) {
            return next(new ErrorHandler("All required fields must be filled", 400));
        }
        // Check if the company already exists
        const existingCompany = await companyModel.findOne({ amdminEmail: adminEmail }); // Schema typo fix
        if (existingCompany) {
            return next(new ErrorHandler("Company with this email already exists", 400));
        }
        // Create a new company
        const company = await companyModel.create({
            companyName,
            adminEmail: adminEmail,
            adminName,
            address,
            password,
        });
        if (!company) {
            return next(new ErrorHandler("failed to register please try again", 400));
        }
        const token = company.generateToken();
        res.cookie("auth-token", token, cookieOption);
        res.status(201).json({
            success: true,
            message: "verify mail please check your mail",
        });
    }
    catch (error) {
        next(new ErrorHandler(error.message || "Internal Server Error", 500));
    }
});
export const companyProfile = asyncHandler(async (req, res, next) => {
    try {
        const company = req?.company;
        if (!company) {
            next(new ErrorHandler("Company is not found", 404));
        }
        res.status(200).json({
            message: "user is found",
            success: true,
            company
        });
    }
    catch (error) {
        next(new ErrorHandler(error.message || "Internal Server Error", 500));
    }
});
export const loginCompnay = asyncHandler(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            next(new ErrorHandler("please fill the all fields", 400));
        }
        const company = await companyModel.findOne({ adminEmail: email }).select("+password");
        if (!company) {
            return next(new ErrorHandler("company not found", 404));
        }
        const isMatch = await company.comparePassword(password);
        if (!isMatch) {
            next(new ErrorHandler("email or password is wrong", 401));
        }
        const token = company.generateToken();
        res.cookie("auth-token", token, cookieOption);
        res.status(200).json({
            token,
            success: true,
            message: "login successuly",
            company,
        });
    }
    catch (error) {
        next(new ErrorHandler(error.message || "Internal Server Error", 500));
    }
});
