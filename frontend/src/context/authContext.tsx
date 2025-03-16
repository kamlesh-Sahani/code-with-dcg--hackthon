"use client";
import { UserType } from "@/models/user.model";
import axios from "axios";
import { createContext, Dispatch, SetStateAction, useState } from "react";
import {useRouter} from "next/navigation";
import toast from "react-hot-toast";
import { ICompany } from "@/type";

interface AuthContextType {
  user: null | UserType;
  setUser: Dispatch<SetStateAction<UserType>>;
  logoutHandler:()=>void;
  company:ICompany | null;
  setCompany:Dispatch<SetStateAction<UserType>>;
}
export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logoutHandler:()=>{},
  company:null,
  setCompany:()=>{}
});
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState();
  const [company,setCompany] = useState();


  const logoutHandler = async () => {
    try {
      const { data } = await axios.get("/api/user/logout");
      console.log(data, "from logout handler");
      if (data.success) {
        setUser(null);
        toast.success(data?.message)
        router.push("/login");
      }else{
        toast.error(data?.message)
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message)
      console.log(error?.response?.data);
    }
  };
  return (
    <AuthContext.Provider value={{ user, setUser,logoutHandler,company,setCompany}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
