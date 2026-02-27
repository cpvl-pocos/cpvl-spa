export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isNotEmpty(value: string): boolean {
  return value.trim() !== '';
}

export function hasMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

export function isEqualToOtherValue(
  value: string,
  otherValue: string
): boolean {
  return value === otherValue;
}

export function hasTwoWords(value: string): boolean {
  return value.trim().split(/\s+/).length >= 2;
}
