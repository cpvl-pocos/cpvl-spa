import { describe, it, expect } from 'vitest';
import { formatPhone, formatDateTime, normalizeString, capitalize, formatMonth } from './format';

describe('formatPhone', () => {
  it('should format 11 digit phone numbers correctly', () => {
    expect(formatPhone('35999999999')).toBe('(35) 99999-9999');
  });

  it('should format 10 digit phone numbers correctly', () => {
    expect(formatPhone('3533333333')).toBe('(35) 3333-3333');
  });

  it('should return "---" for undefined or empty input', () => {
    expect(formatPhone(undefined)).toBe('---');
    expect(formatPhone('')).toBe('---');
  });

  it('should return original string if it doesn\'t match expected lengths', () => {
    expect(formatPhone('123')).toBe('123');
  });
});

describe('formatDateTime', () => {
  it('should format Date objects correctly', () => {
    const date = new Date(2026, 3, 24, 15, 30); // 24/Apr/2026
    // Note: Month is 0-indexed in Date constructor, so 3 is April
    const result = formatDateTime(date);
    expect(result).toContain('24/abr/2026');
    expect(result).toContain('15:30');
  });

  it('should format ISO strings correctly', () => {
    const isoString = '2026-04-24T18:14:28Z';
    expect(formatDateTime(isoString)).toContain('24/abr/2026');
  });

  it('should return "---" for undefined input', () => {
    expect(formatDateTime(undefined)).toBe('---');
  });
});

describe('normalizeString', () => {
  it('should lowercase and trim strings', () => {
    expect(normalizeString('  TESTING  ')).toBe('testing');
  });

  it('should return empty string for null or undefined', () => {
    expect(normalizeString(null)).toBe('');
    expect(normalizeString(undefined)).toBe('');
  });

  it('should handle numbers by converting to string', () => {
    expect(normalizeString(123)).toBe('123');
  });
});

describe('capitalize', () => {
  it('should capitalize the first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('should not change already capitalized strings', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });
});

// NEW FEATURE: formatMonth
describe('formatMonth', () => {
  it('should return month name correctly', () => {
    expect(formatMonth(1)).toBe('Janeiro');
    expect(formatMonth(12)).toBe('Dezembro');
  });
});
