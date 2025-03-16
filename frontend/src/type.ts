export interface ICompany  {
    companyName: string;
    amdminEmail: string;
    adminName:string;
    address?: {
      city: string;
      state: string;
      country: string;
    };
    password:string;
    isActive:boolean;
    comparePassword:(password:string)=>Promise<boolean>;
    generateToken:()=>string;
  }