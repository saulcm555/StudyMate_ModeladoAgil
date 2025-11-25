/**
 * Utilidades para manejo de fechas
 * Evita problemas de conversión de zona horaria
 */

/**
 * Convierte una fecha a formato YYYY-MM-DD en la zona horaria local
 * @param date - Fecha a convertir
 * @returns String en formato YYYY-MM-DD
 */
export function formatDateForInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convierte una fecha en formato YYYY-MM-DD a formato ISO con hora del mediodía
 * Usar mediodía (12:00) evita que la conversión a UTC cambie el día
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns String en formato ISO con hora del mediodía
 */
export function formatDateForSubmit(dateString: string): string {
  return `${dateString}T12:00:00`;
}

/**
 * Parsea una fecha ISO string a Date en zona horaria local
 * @param dateString - Fecha en formato ISO
 * @returns Date en zona horaria local
 */
export function parseLocalDate(dateString: string): Date {
  // Si la fecha viene con formato YYYY-MM-DD, parsearlo directamente
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * @returns String en formato YYYY-MM-DD
 */
export function getTodayFormatted(): string {
  return formatDateForInput(new Date());
}

