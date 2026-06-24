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

export function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;

  // Reject known invalid CPFs
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(9))) return false;

  // Validate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

