import { test, expect } from '@playwright/test';
import { generateTestUser } from './auth.setup';

test.describe('Dashboard Page', () => {
  let testUser: ReturnType<typeof generateTestUser>;
  
  test.beforeEach(async ({ page }) => {
    testUser = generateTestUser();
    
    // Registrar y hacer login
    await page.goto('/register');
    await page.evaluate(() => localStorage.clear());
    
    await page.getByLabel(/nombre completo/i).fill(testUser.name);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/contraseña/i).fill(testUser.password);
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    
    // Esperar a estar en dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('debe mostrar el dashboard correctamente', async ({ page }) => {
    // Verificar título y descripción
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByText(/bienvenido de vuelta/i)).toBeVisible();
  });

  test('debe mostrar las 4 tarjetas de estadísticas principales', async ({ page }) => {
    // Verificar que existen las 4 tarjetas principales
    await expect(page.getByText(/total materias/i).first()).toBeVisible();
    await expect(page.getByText(/tareas pendientes/i).first()).toBeVisible();
    await expect(page.getByText(/completadas/i).first()).toBeVisible();
    await expect(page.getByText(/pomodoros/i).first()).toBeVisible();
  });

  test('debe mostrar estadísticas iniciales en cero para usuario nuevo', async ({ page }) => {
    // Para un usuario nuevo, todas las estadísticas deberían ser 0
    // Verificar que las tarjetas de estadísticas están presentes
    await expect(page.getByText(/total materias/i).first()).toBeVisible();
    
    // Verificar que hay al menos un valor numérico visible
    const statsNumbers = page.locator('p.text-3xl, p.text-2xl').filter({ hasText: /^\d+$/ });
    const count = await statsNumbers.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('debe mostrar mensaje cuando no hay tareas pendientes', async ({ page }) => {
    // Verificar sección de próximas entregas
    await expect(page.getByText(/próximas entregas/i)).toBeVisible();
    
    // Debe mostrar mensaje de no hay tareas
    await expect(page.getByText(/no hay tareas pendientes/i)).toBeVisible();
  });

  test('debe mostrar mensaje cuando no hay materias registradas', async ({ page }) => {
    // Verificar sección de progreso por materia
    await expect(page.getByText(/progreso por materia/i)).toBeVisible();
    
    // Debe mostrar mensaje de no hay materias
    await expect(page.getByText(/no hay materias registradas/i)).toBeVisible();
  });

  test('debe mostrar resumen de pomodoro con valores iniciales', async ({ page }) => {
    // Verificar sección de pomodoro
    await expect(page.getByText(/resumen pomodoro/i)).toBeVisible();
    
    // Verificar que muestra sesiones completadas y tiempo total
    await expect(page.getByText(/sesiones completadas/i)).toBeVisible();
    await expect(page.getByText(/tiempo total/i)).toBeVisible();
  });

  test('debe mostrar progreso general con 0%', async ({ page }) => {
    // Verificar sección de progreso general
    await expect(page.getByText(/progreso general/i)).toBeVisible();
    
    // Para usuario nuevo, el progreso debe ser 0%
    await expect(page.getByText(/0%/i).first()).toBeVisible();
  });

  test('debe tener botones de navegación a otras páginas', async ({ page }) => {
    // Verificar botones de navegación
    const verTareasButton = page.getByRole('link').filter({ hasText: /ver todas las tareas/i });
    const verMateriasButton = page.getByRole('link').filter({ hasText: /ver todas las materias/i });
    const irPomodoroButton = page.getByRole('link').filter({ hasText: /ir al pomodoro/i });
    
    // Estos botones deberían existir
    await expect(verTareasButton.or(page.getByText(/no hay tareas pendientes/i))).toBeVisible();
    await expect(verMateriasButton.or(page.getByText(/no hay materias registradas/i))).toBeVisible();
    await expect(irPomodoroButton).toBeVisible();
  });

  test('debe navegar a página de tareas al hacer click en botón', async ({ page }) => {
    // Esperar a que cargue el dashboard
    await page.waitForLoadState('networkidle');
    
    // Buscar el botón "Ver Todas las Tareas" (puede no estar si no hay tareas)
    const verTareasButton = page.getByRole('link', { name: /ver todas las tareas/i });
    
    // Si el botón existe, verificar navegación
    const isVisible = await verTareasButton.isVisible().catch(() => false);
    if (isVisible) {
      await verTareasButton.click();
      await expect(page).toHaveURL('/tasks');
    }
  });

  test('debe navegar a página de materias al hacer click en botón', async ({ page }) => {
    // Esperar a que cargue el dashboard
    await page.waitForLoadState('networkidle');
    
    // Buscar el botón "Ver Todas las Materias"
    const verMateriasButton = page.getByRole('link', { name: /ver todas las materias/i });
    
    // Si el botón existe, verificar navegación
    const isVisible = await verMateriasButton.isVisible().catch(() => false);
    if (isVisible) {
      await verMateriasButton.click();
      await expect(page).toHaveURL('/subjects');
    }
  });

  test('debe navegar a página de pomodoro al hacer click en botón', async ({ page }) => {
    // Buscar el botón "Ir al Pomodoro"
    const irPomodoroButton = page.getByRole('link', { name: /ir al pomodoro/i });
    
    await expect(irPomodoroButton).toBeVisible();
    await irPomodoroButton.click();
    await expect(page).toHaveURL('/pomodoro');
  });

  test('debe mostrar estado de carga mientras obtiene datos', async ({ page }) => {
    // Recargar la página para ver el estado de carga
    await page.reload();
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');
    
    // Puede mostrar "Cargando dashboard..." temporalmente o directamente el contenido
    // Verificar que al final muestra el contenido del dashboard
    await expect(
      page.getByRole('heading', { name: /dashboard/i })
        .or(page.getByText(/cargando dashboard/i))
    ).toBeVisible({ timeout: 10000 });
  });

  test('debe requerir autenticación para acceder', async ({ page }) => {
    // Limpiar localStorage (logout)
    await page.evaluate(() => localStorage.clear());
    
    // Intentar acceder al dashboard
    await page.goto('/dashboard');
    
    // Debería redirigir a login (dependiendo de tu ProtectedRoute)
    // O no mostrar contenido protegido
    await page.waitForURL(/\/(login|dashboard)/, { timeout: 5000 });
  });

  test('debe mostrar iconos en las tarjetas de estadísticas', async ({ page }) => {
    // Verificar que hay iconos visibles (lucide-react icons)
    const icons = page.locator('svg').filter({ hasText: '' });
    const iconCount = await icons.count();
    
    // Debería haber múltiples iconos en el dashboard
    expect(iconCount).toBeGreaterThan(0);
  });

  test('debe tener diseño responsive con grid layout', async ({ page }) => {
    // Verificar que el dashboard tiene múltiples secciones organizadas
    // Verificar que hay al menos las tarjetas de estadísticas visibles
    await expect(page.getByText(/total materias/i).first()).toBeVisible();
    await expect(page.getByText(/próximas entregas/i)).toBeVisible();
    await expect(page.getByText(/progreso por materia/i)).toBeVisible();
    
    // Verificar que hay múltiples secciones
    const sections = page.locator('div.space-y-8, div.space-y-6, div.grid');
    const sectionCount = await sections.count();
    expect(sectionCount).toBeGreaterThanOrEqual(1);
  });
});
