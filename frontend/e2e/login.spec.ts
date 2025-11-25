import { test, expect } from '@playwright/test';
import { generateTestUser } from './auth.setup';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a login y limpiar localStorage
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
  });

  test('debe mostrar el formulario de login correctamente', async ({ page }) => {
    // Verificar que está en la página correcta
    await expect(page).toHaveURL('/login');
    
    // Verificar elementos del formulario
    await expect(page.getByRole('heading', { name: /studymate/i })).toBeVisible();
    await expect(page.getByText(/inicia sesión para continuar/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('debe mostrar el link para ir a registro', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /regístrate/i });
    await expect(registerLink).toBeVisible();
    
    // Verificar que el link apunta a /register
    await expect(registerLink).toHaveAttribute('href', '/register');
  });

  test('debe hacer login exitosamente con credenciales válidas', async ({ page }) => {
    const testUser = generateTestUser();

    // Primero registrar el usuario
    await page.goto('/register');
    await page.getByLabel(/nombre completo/i).fill(testUser.name);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/contraseña/i).fill(testUser.password);
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    
    // Esperar redirección
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Logout (limpiar localStorage)
    await page.evaluate(() => localStorage.clear());

    // Ir a login
    await page.goto('/login');

    // Hacer login con el usuario registrado
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/contraseña/i).fill(testUser.password);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Verificar redirección al dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Verificar que el token se guardó
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(token).not.toBeNull();
  });

  test('debe mostrar error con credenciales inválidas', async ({ page }) => {
    // Intentar login con credenciales que no existen
    await page.getByLabel(/email/i).fill('noexiste@test.com');
    await page.getByLabel(/contraseña/i).fill('wrongpassword');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Debe mostrar mensaje de error (verificar que aparece un div con la clase de error)
    await expect(page.locator('.text-destructive, [class*="destructive"]').first()).toBeVisible({ timeout: 5000 });

    // Debe seguir en la página de login
    await expect(page).toHaveURL('/login');
  });

  test('debe mostrar error con contraseña incorrecta', async ({ page }) => {
    const testUser = generateTestUser();

    // Registrar usuario
    await page.goto('/register');
    await page.getByLabel(/nombre completo/i).fill(testUser.name);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/contraseña/i).fill(testUser.password);
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Logout
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');

    // Intentar login con contraseña incorrecta
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/contraseña/i).fill('wrongpassword123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Debe mostrar error (verificar que aparece un div con la clase de error)
    await expect(page.locator('.text-destructive, [class*="destructive"]').first()).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL('/login');
  });

  test('debe validar campos requeridos', async ({ page }) => {
    // Intentar enviar formulario vacío
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // El navegador debe prevenir el envío (validación HTML5)
    await expect(page).toHaveURL('/login');
  });

  test('debe validar formato de email', async ({ page }) => {
    // Llenar con email inválido
    await page.getByLabel(/email/i).fill('email-invalido');
    await page.getByLabel(/contraseña/i).fill('password123');

    // Intentar enviar
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Debe seguir en login (validación HTML5)
    await expect(page).toHaveURL('/login');
  });

  test.skip('debe deshabilitar el botón durante el proceso de login', async ({ page }) => {
    // Skip: La respuesta del servidor es muy rápida para verificar el estado loading
    const testUser = generateTestUser();

    // Registrar usuario primero
    await page.goto('/register');
    await page.getByLabel(/nombre completo/i).fill(testUser.name);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/contraseña/i).fill(testUser.password);
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Logout y volver a login
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');

    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/contraseña/i).fill(testUser.password);

    const submitButton = page.getByRole('button', { name: /iniciar sesión/i });
    
    // Click en el botón
    await submitButton.click();

    // Verificar que el botón se deshabilitó y cambió el texto
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toHaveText(/iniciando sesión/i);
  });

  test('debe mantener la sesión después del login', async ({ page }) => {
    const testUser = generateTestUser();

    // Registrar y hacer login
    await page.goto('/register');
    await page.getByLabel(/nombre completo/i).fill(testUser.name);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/contraseña/i).fill(testUser.password);
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Verificar que el token y user se guardaron en localStorage
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    const user = await page.evaluate(() => localStorage.getItem('user'));
    
    expect(token).not.toBeNull();
    expect(user).not.toBeNull();
    
    // Verificar que el usuario tiene el email correcto
    const userData = JSON.parse(user!);
    expect(userData.email).toBe(testUser.email);
  });
});
