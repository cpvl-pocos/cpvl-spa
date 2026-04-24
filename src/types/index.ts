export interface IAllowedRoutes {
  label: string;
  route: string;
}

export interface IPaymentMonthly {
  id?: number;
  userId: number;
  ref_year: number | string;
  ref_month: number;
  amount: number | string;
  type?: string;
  description?: string;
  status?: string;
  date?: Date;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IPilot {
  id?: number;
  userId: number;
  firstName: string;
  lastName: string;
  cpf: string;
  cellphone: string;
  email: string;
  status: string;
  photoUrl?: string;
  bloodType?: string;
  emergencyPhone?: string;
  emergencyContactName?: string;
  allergies?: string;
  ref_month?: number | string;
  ref_year?: number | string;
  paymentMonthlies?: IPaymentMonthly[];
}

export interface ILicenseData {
  id?: number;
  userId: number;
  civl?: string;
  pilotLevel?: string;
  cbvlExpiration?: string | Date;
  imgCbvl?: string;
  anacExpiration?: string | Date;
  imgAnac?: string;
  status?: string;
}

export interface IEmergencyContact {
  id?: number;
  userId: number;
  bloodType?: string;
  emergencyPhone?: string;
  emergencyContactName?: string;
  allergies?: string;
}

export interface IUser {
  id: number;
  username: string;
  role: string;
}

export interface IProfileData {
  user: IUser;
  pilotInfo: IPilot | null;
  routes: IAllowedRoutes[];
  warnings: string[];
}
