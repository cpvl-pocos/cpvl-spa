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
