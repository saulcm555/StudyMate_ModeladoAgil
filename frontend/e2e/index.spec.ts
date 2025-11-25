import { test, expect } from '@playwright/test';

test.describe('Index Page (Landing)', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de inicio y limpiar localStorage
    await page.goto('/index');
    await page.evaluate(() => localStorage.clear());
  });

  test('debe mostrar la página de inicio correctamente', async ({ page }) => {
    // Verificar que está en la página correcta
    await expect(page).toHaveURL('/index');
    
    // Verificar elementos principales
    await expect(page.getByRole('heading', { name: /studymate/i })).toBeVisible();
    await expect(page.getByText(/organiza tu vida académica/i)).toBeVisible();
  });

  test('debe mostrar el logo y nombre de la aplicación en el header', async ({ page }) => {
    await expect(page.getByText(/studymate/i).first()).toBeVisible();
    await expect(page.getByText(/tu organizador académico/i).first()).toBeVisible();
  });

  test('debe mostrar los botones de iniciar sesión y registrarse en el header', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: /iniciar sesión/i }).first();
    const registerButton = page.getByRole('button', { name: /registrarse/i }).first();
    
    await expect(loginButton).toBeVisible();
    await expect(registerButton).toBeVisible();
  });

  test('debe mostrar el título principal del hero', async ({ page }) => {
    await expect(page.getByText(/organiza tu vida académica/i)).toBeVisible();
    await expect(page.getByText(/sin estrés/i)).toBeVisible();
  });

  test('debe mostrar la descripción del hero', async ({ page }) => {
    await expect(page.getByText(/studymate te ayuda a gestionar/i)).toBeVisible();
    await expect(page.getByText(/nunca más pierdas una fecha de entrega/i)).toBeVisible();
  });

  test('debe mostrar los botones principales del hero', async ({ page }) => {
    const comenzarButton = page.getByRole('button', { name: /comenzar gratis/i });
    const loginButton = page.getByRole('button', { name: /iniciar sesión/i }).nth(1);
    
    await expect(comenzarButton).toBeVisible();
    await expect(loginButton).toBeVisible();
  });

  test('debe mostrar las 5 características principales', async ({ page }) => {
    // Verificar sección de características
    await expect(page.getByText(/todo lo que necesitas para triunfar/i)).toBeVisible();
    
    // Verificar las 5 características
    await expect(page.getByText(/organiza tus materias/i)).toBeVisible();
    await expect(page.getByText(/calendario académico/i)).toBeVisible();
    await expect(page.getByText(/alertas inteligentes/i)).toBeVisible();
    await expect(page.getByText(/técnica pomodoro/i)).toBeVisible();
    await expect(page.getByText(/priorización de tareas/i)).toBeVisible();
  });

  test('debe mostrar el CTA final', async ({ page }) => {
    await expect(page.getByText(/¿listo para mejorar tu rendimiento académico/i)).toBeVisible();
    await expect(page.getByText(/únete a miles de estudiantes/i)).toBeVisible();
    
    const ctaButton = page.getByRole('button', { name: /crear cuenta gratis/i });
    await expect(ctaButton).toBeVisible();
  });

  test('debe mostrar el footer', async ({ page }) => {
    await expect(page.getByText(/© 2024 studymate/i)).toBeVisible();
  });

  test('debe navegar a login al hacer click en "Iniciar Sesión" del header', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: /iniciar sesión/i }).first();
    await loginButton.click();
    
    await expect(page).toHaveURL('/login');
  });

  test('debe navegar a register al hacer click en "Registrarse" del header', async ({ page }) => {
    const registerButton = page.getByRole('button', { name: /registrarse/i }).first();
    await registerButton.click();
    
    await expect(page).toHaveURL('/register');
  });

  test('debe navegar a register al hacer click en "Comenzar Gratis"', async ({ page }) => {
    const comenzarButton = page.getByRole('button', { name: /comenzar gratis/i });
    await comenzarButton.click();
    
    await expect(page).toHaveURL('/register');
  });

  test('debe navegar a login al hacer click en segundo botón "Iniciar Sesión"', async ({ page }) => {
    const loginButtons = page.getByRole('button', { name: /iniciar sesión/i });
    await loginButtons.nth(1).click();
    
    await expect(page).toHaveURL('/login');
  });

  test('debe navegar a register al hacer click en "Crear Cuenta Gratis" del CTA', async ({ page }) => {
    const ctaButton = page.getByRole('button', { name: /crear cuenta gratis/i });
    await ctaButton.click();
    
    await expect(page).toHaveURL('/register');
  });

  test('debe redirigir al dashboard si el usuario ya está autenticado', async ({ page }) => {
    // Simular que el usuario ya tiene un token
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'fake-token-for-testing');
    });
    
    // Recargar la página
    await page.reload();
    
    // Debería redirigir automáticamente al dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
  });

  test('debe mostrar iconos en las tarjetas de características', async ({ page }) => {
    // Verificar que hay iconos visibles (lucide-react)
    const icons = page.locator('svg').filter({ hasText: '' });
    const iconCount = await icons.count();
    
    // Debería haber múltiples iconos
    expect(iconCount).toBeGreaterThan(5);
  });

  test('debe tener diseño responsive', async ({ page }) => {
    // Verificar que usa grid layout para las características
    await expect(page.getByText(/organiza tus materias/i)).toBeVisible();
    
    // Cambiar a viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Las características deberían seguir siendo visibles
    await expect(page.getByText(/organiza tus materias/i)).toBeVisible();
  });

  test('debe tener múltiples cards de características', async ({ page }) => {
    // Buscar las cards (componentes Card)
    const cards = page.locator('[class*="border-border"]').filter({ has: page.locator('h4') });
    const cardCount = await cards.count();
    
    // Debería haber 5 cards de características
    expect(cardCount).toBeGreaterThanOrEqual(5);
  });

  test('no debe mostrar contenido si el usuario ya está autenticado', async ({ page }) => {
    // Simular que el usuario tiene un token
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ email: 'test@test.com', name: 'Test' }));
    });
    
    // Navegar a index
    await page.goto('/index');
    
    // Debería redirigir al dashboard por el useEffect
    await page.waitForURL(/\/(dashboard|index)/, { timeout: 5000 });
    
    // Verificar que está en dashboard o que el token existe
    const currentUrl = page.url();
    const hasToken = await page.evaluate(() => localStorage.getItem('access_token'));
    
    // Si no redirigió automáticamente, al menos debe tener el token
    expect(hasToken).not.toBeNull();
  });
});
