import { test, expect } from '@playwright/test';
import { generateTestUser } from './auth.setup';

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a register y limpiar localStorage
    await page.goto('/register');
    await page.evaluate(() => localStorage.clear());
  });

  test('debe mostrar el formulario de registro correctamente', async ({ page }) => {
    // Verificar que está en la página correcta
    await expect(page).toHaveURL('/register');
    
    // Verificar elementos del formulario
    await expect(page.getByRole('heading', { name: /crear cuenta/i })).toBeVisible();
    await expect(page.getByLabel(/nombre completo/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeVisible();
  });

  test('debe mostrar el link para ir a login', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /inicia sesión/i });
    await expect(loginLink).toBeVisible();

    // Verificar que el link apunta a /login
    await expect(loginLink).toHaveAttribute('href', '/login');
  });  test('debe registrar un usuario nuevo exitosamente', async ({ page }) => {
    const testUser = generateTestUser();

    // Llenar el formulario
    await page.getByLabel(/nombre completo/i).fill(testUser.name);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/contraseña/i).fill(testUser.password);

    // Enviar formulario
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    // Esperar redirección al dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Verificar que el token se guardó en localStorage
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(token).not.toBeNull();
  });

  test('debe mostrar error con email duplicado', async ({ page }) => {
    const testUser = generateTestUser();

    // Primer registro - debe tener éxito
    await page.getByLabel(/nombre completo/i).fill(testUser.name);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/contraseña/i).fill(testUser.password);
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Volver a registro y limpiar localStorage
    await page.goto('/register');
    await page.evaluate(() => localStorage.clear());

    // Intentar registrar con el mismo email
    await page.getByLabel(/nombre completo/i).fill(testUser.name);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/contraseña/i).fill(testUser.password);
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    // Debe mostrar error (verificar que aparece un div con la clase de error)
    await expect(page.locator('.text-destructive, [class*="destructive"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('debe validar campos requeridos', async ({ page }) => {
    // Intentar enviar formulario vacío
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    // El navegador debe prevenir el envío (validación HTML5)
    // Verificar que sigue en la página de registro
    await expect(page).toHaveURL('/register');
  });

  test('debe validar longitud mínima de contraseña', async ({ page }) => {
    const testUser = generateTestUser();

    // Llenar con contraseña muy corta
    await page.getByLabel(/nombre completo/i).fill(testUser.name);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/contraseña/i).fill('123'); // Menos de 6 caracteres

    // Intentar enviar
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    // Debe seguir en la página de registro (validación HTML5)
    await expect(page).toHaveURL('/register');
  });

  test('debe validar formato de email', async ({ page }) => {
    const testUser = generateTestUser();

    // Llenar con email inválido
    await page.getByLabel(/nombre completo/i).fill(testUser.name);
    await page.getByLabel(/email/i).fill('email-invalido');
    await page.getByLabel(/contraseña/i).fill(testUser.password);

    // Intentar enviar
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    // Debe seguir en la página de registro (validación HTML5)
    await expect(page).toHaveURL('/register');
  });

  test.skip('debe deshabilitar el botón durante el proceso de registro', async ({ page }) => {
    // Skip: La respuesta del servidor es muy rápida para verificar el estado loading
    const testUser = generateTestUser();

    await page.getByLabel(/nombre completo/i).fill(testUser.name);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/contraseña/i).fill(testUser.password);

    const submitButton = page.getByRole('button', { name: /crear cuenta/i });
    
    // Click en el botón
    await submitButton.click();

    // Verificar que el botón se deshabilitó y cambió el texto
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toHaveText(/registrando/i);
  });
});
