import { test as setup } from '@playwright/test';

/**
 * Este archivo contiene utilidades compartidas para las pruebas de autenticación
 */

/**
 * Genera un email único para pruebas
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `test-${timestamp}-${random}@test.com`;
}

/**
 * Genera datos de prueba para un usuario
 */
export function generateTestUser() {
  return {
    name: 'Usuario de Prueba',
    email: generateTestEmail(),
    password: 'password123'
  };
}
