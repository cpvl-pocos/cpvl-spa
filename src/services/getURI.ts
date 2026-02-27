// const BASE_URI = import.meta.env.VITE_API_URI;
const BASE_URI = (import.meta.env.VITE_API_URI || '').replace(/\/+$/, '');
console.log('BASE_URI loaded:', BASE_URI);

export const API = {
  profile: 'profile',
  login: 'login',
  me: 'me',
  pilots: 'pilots',
  userAdd: 'users/addUser',
  status: 'pilots/status-list',
  updateStatusPilot: 'pilots/statusPilot',
  paymentMonthly: 'paymentMonthly',
  confirmPayment: 'paymentMonthly/confirmPayment',
  confirmPaymentBatch: 'paymentMonthly/confirmPaymentBatch',
  createPaymentMonthly: 'paymentMonthly',
  deletePaymentMonthly: 'paymentMonthly',
  statusCadastral: 'pilots/statusCadastral',
  statusPayment: 'pilots/statusPayment',
  validStatusCadastral: 'pilots/validStatusCadastral',
  validStatusPayment: 'pilots/validStatusPayment',
  forgotPassword: 'users/forgot-password',
  resetPassword: 'users/reset-password',
  emergencyContacts: 'emergency-contacts',
  licenseData: 'license-data',
  updateProfile: 'pilots/me/profile'
} as const;


// export const getURI = (api: string) => `${BASE_URI}/${api}`;
export const getURI = (api: string) => {
  if (!BASE_URI) return api; // fallback para facilitar testes em ambientes sem env
  // garante que API não gere // entre BASE_URI e api
  return `${BASE_URI}/${api.replace(/^\/+/, '')}`;
};
