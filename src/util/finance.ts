import type { IPaymentMonthly } from '@/types';

/**
 * Parses an amount value from number or string to a safe number
 */
export const parseAmount = (amount: any): number => {
  if (!amount) return 0;
  const v = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(',', '.'));
  return isNaN(v) ? 0 : v;
};

/**
 * Calculates financial summary (total, totalMissing, totalAmount)
 */
export const calculateFinancialSummary = (payments: IPaymentMonthly[]) => {
  const totalAmount = payments.reduce((sum, p) => sum + parseAmount(p.amount), 0);
  const paidMonthsCount = new Set(
    payments.filter(p => p.status === 'Confirmado').map(p => p.ref_month)
  ).size;
  
  return { 
    total: payments.length, 
    totalMissing: 12 - paidMonthsCount, 
    totalAmount 
  };
};

/**
 * Groups contiguous unpaid months into batches of at least 3 for bulk confirmation
 */
export const groupPaymentsByBatch = (payments: IPaymentMonthly[]): IPaymentMonthly[][] => {
  const groups: IPaymentMonthly[][] = [];
  const sorted = [...payments]
    .filter(p => p.status !== 'Confirmado')
    .sort((a, b) => a.ref_month - b.ref_month);

  let currentGroup: IPaymentMonthly[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    if (currentGroup.length === 0) {
      currentGroup.push(p);
      continue;
    }
    const last = currentGroup[currentGroup.length - 1];
    if (
      p.ref_year === last.ref_year && 
      p.ref_month === last.ref_month + 1 && 
      p.type === last.type
    ) {
      currentGroup.push(p);
    } else {
      if (currentGroup.length >= 3) groups.push(currentGroup);
      currentGroup = [p];
    }
  }
  if (currentGroup.length >= 3) groups.push(currentGroup);
  
  return groups;
};
