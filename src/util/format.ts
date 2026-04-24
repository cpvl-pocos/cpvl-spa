import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formats a phone number string to (XX) XXXXX-XXXX
 */
export const formatPhone = (phone: string | undefined): string => {
  if (!phone) return '---';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 11) {
    if (clean.length === 10) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
    }
    return phone;
  }
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
};

/**
 * Formats a date to a readable string using date-fns
 */
export const formatDateTime = (date: Date | string | undefined): string => {
  if (!date) return '---';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, "dd/MMM/yyyy HH:mm", { locale: ptBR });
};

/**
 * Normalizes a string for search (lowercase, trimmed)
 */
export const normalizeString = (v: any): string =>
  v === null || v === undefined ? '' : String(v).trim().toLowerCase();

/**
 * Capitalizes the first letter of a string
 */
export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Returns the name of the month (1-indexed)
 */
export const formatMonth = (month: number): string => {
  return [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ][month - 1] || `Mês ${month}`;
};
