"use client";
import { useState, useEffect, useContext } from "react";
import { Gitlab } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { AuthContext } from "@/context/authContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import api from "@/lib/api";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchMe = async () => {
    try {
      const role = localStorage.getItem("role");
      let data:any;
      if (role === "company") {
        const res = await api.get("/company/me");
        data = res.data;
      }
      if (role === "user") {
        const res = await api.get("/user/me");
        data = res.data;
      }
      console.log(data);
      console.log(data, "me");
      if (data.success) {
        setUser(data.user);
      }
    } catch (error: any) {
      setUser(null);
      console.log(error?.response?.data);
    }
  };

  useEffect(() => {
    if (!user) {
      fetchMe();
    }
  }, [user]);
  return (
    <div
      className={`flex justify-between items-center  max-sm:w-[90%] px-5 h-[60px] sm:w-[75%] mx-auto rounded-2xl fixed top-4 z-50 left-1/2 -translate-x-1/2 transition-all duration-300 ${
        scrolled
          ? "bg-black/20 backdrop-blur-lg shadow shadow-[#333333]"
          : "bg-transparent"
      }`}
    >
      <Link href={"/"}>
        <div className="flex justify-center items-center gap-2">
          <div className="w-[40px] h-[40px] rounded-full bg-mainColor flex justify-center items-center">
            <Gitlab className="text-2xl" />
          </div>
          <h1 className="font-semibold text-[25px]  bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white">
            HireFlow AI
          </h1>
        </div>
      </Link>
      <div className="flex justify-center items-center gap-5">
        {user && user?.email ? (
          <Link href={"/profile"}>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <div className="flex  items-center justify-center gap-3">
            <Link href={"/candidate/login"} className="font-medium text-[13px]">
              <button
                className="bg-transparent text-white px-4 py-2 text-[17px] rounded-xl font-semibold flex justify-center items-center gap-3 border-2 border-[#eee] transition-all hover:shadow-lg"
                aria-label="Login to CodeHire"
              >
                <p>Candidate Login</p>
              </button>
            </Link>
            <Link href={"/company/login"} className="font-medium text-[13px]">
              <button
                className="bg-mainColor text-black px-4 py-2 text-[17px] rounded-xl font-semibold flex justify-center items-center gap-3 hover:shadow-mainColor/50 transition-all hover:shadow-lg"
                aria-label="Login to CodeHire"
              >
                <p>Company Login</p>
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
