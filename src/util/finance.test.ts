import { describe, it, expect } from 'vitest';
import { parseAmount, calculateFinancialSummary, groupPaymentsByBatch } from './finance';
import type { IPaymentMonthly } from '@/types';

describe('parseAmount', () => {
  it('should parse number correctly', () => {
    expect(parseAmount(50)).toBe(50);
  });

  it('should parse string with dot correctly', () => {
    expect(parseAmount('50.50')).toBe(50.5);
  });

  it('should parse string with comma correctly', () => {
    expect(parseAmount('50,50')).toBe(50.5);
  });

  it('should return 0 for invalid input', () => {
    expect(parseAmount(undefined)).toBe(0);
    expect(parseAmount('abc')).toBe(0);
  });
});

describe('calculateFinancialSummary', () => {
  it('should calculate summary correctly', () => {
    const payments: IPaymentMonthly[] = [
      { ref_month: 1, amount: 50, status: 'Confirmado' } as IPaymentMonthly,
      { ref_month: 2, amount: 50, status: 'Confirmado' } as IPaymentMonthly,
      { ref_month: 3, amount: 50, status: 'Pendente' } as IPaymentMonthly,
    ];
    const summary = calculateFinancialSummary(payments);
    expect(summary.total).toBe(3);
    expect(summary.totalMissing).toBe(10); // 12 - 2 paid
    expect(summary.totalAmount).toBe(150);
  });
});

describe('groupPaymentsByBatch', () => {
  it('should group contiguous unpaid months into batches of at least 3', () => {
    const payments: IPaymentMonthly[] = [
      { ref_year: '2026', ref_month: 1, status: 'Pendente', type: 'mensal' } as IPaymentMonthly,
      { ref_year: '2026', ref_month: 2, status: 'Pendente', type: 'mensal' } as IPaymentMonthly,
      { ref_year: '2026', ref_month: 3, status: 'Pendente', type: 'mensal' } as IPaymentMonthly,
      { ref_year: '2026', ref_month: 5, status: 'Pendente', type: 'mensal' } as IPaymentMonthly,
    ];
    const batches = groupPaymentsByBatch(payments);
    expect(batches.length).toBe(1);
    expect(batches[0].length).toBe(3); // Jan, Feb, Mar
    expect(batches[0][0].ref_month).toBe(1);
  });

  it('should not group if less than 3 contiguous months', () => {
    const payments: IPaymentMonthly[] = [
      { ref_year: '2026', ref_month: 1, status: 'Pendente', type: 'mensal' } as IPaymentMonthly,
      { ref_year: '2026', ref_month: 2, status: 'Pendente', type: 'mensal' } as IPaymentMonthly,
    ];
    const batches = groupPaymentsByBatch(payments);
    expect(batches.length).toBe(0);
  });
});
