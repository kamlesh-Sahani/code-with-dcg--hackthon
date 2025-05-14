"use server";
import userModel from "@/models/user.model";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import { registerDataType } from "../candidate/register/page";
import { LoginDataType } from "../candidate/login/page";
import { RegisterDataType as companyRegisterType } from "../company/register/page";
import companyModel from "@/models/company.model";
const setCookie = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
};

export const registerAction = async (registerData: registerDataType) => {
  try {
    await dbConnect();
    const { name, email, password } = registerData;
    if (!name || !email || !password) {
      return {
        success: false,
        message: "please fill the all fields",
      };
    }

    const isExist = await userModel.findOne({ email });
    if (isExist) {
      return {
        success: false,
        message: "user is already exist",
      };
    }

    const user = await userModel.create({
      name,
      email,
      password,
    });
    if (!user) {
      return {
        success: false,
        message: "something went wrong",
      };
    }
    const token = user.generateToken();
    await setCookie(token);
    return {
      success: true,
      message: "Register successfuly",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "something went wrong",
    };
  }
};

export const loginAction = async(loginData:LoginDataType)=>{
  try {
   await dbConnect();
    const {email,password} = loginData;
    console.log("server",email,password);
    if(!email || !password){
      return {
        success: false,
        message: "please fill the all fields",
      };
    }

    const user = await userModel.findOne({email}).select("+password");
    if(!user){
      return {
        success:false,
        message:"user is not found"
      }
    }
    const isMatch = await user.comparePassword(password);
    if(!isMatch){
      return {
        success:false,
        message:"email or password is wrong"
      }

    }

    const token = user.generateToken();
    await setCookie(token);
    return {
      success:true,
      message:"login successuly"
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "something went wrong",
    };
  }
}

export const companyRegister = async (registerData: companyRegisterType) => {
  try {
    await dbConnect();
    const { companyName, adminEmail, adminName, address, password } = registerData;
    
    if (!companyName || !adminEmail || !adminName || !password) {
      return {
        success: false,
        message: "Please fill all required fields",
      };
    }

    const isExist = await companyModel.findOne({ adminEmail });
    if (isExist) {
      return {
        success: false,
        message: "Company with this email already exists",
      };
    }

    const company = await companyModel.create({
      companyName,
      adminEmail,
      adminName,
      address,
      password,
    });

    if (!company) {
      return {
        success: false,
        message: "Failed to create company account",
      };
    }

    // You might want to send an activation email here
    // For now, we'll just return success
    const token = company.generateToken();
    await setCookie(token);
    return {
      success: true,
      message: "Company registered successfully. Please wait for activation.",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Something went wrong during registration",
    };
  }
};

export const companyLogin = async (loginData: LoginDataType) => {
  try {
    await dbConnect();
    const { email, password } = loginData;
    
    if (!email || !password) {
      return {
        success: false,
        message: "Please provide email and password",
      };
    }

    const company = await companyModel.findOne({ adminEmail: email }).select("+password");
    
    if (!company) {
      return {
        success: false,
        message: "Company not found",
      };
    }

    const isMatch = await company.comparePassword(password);
    if (!isMatch) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    const token = company.generateToken();
    await setCookie(token);
    
    return {
      success: true,
      message: "Login successful",
      company: {
        id: company._id,
        name: company.companyName,
        email: company.adminEmail
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Something went wrong during login",
    };
  }
};
