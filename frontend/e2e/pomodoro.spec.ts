import { test, expect } from '@playwright/test';
import { generateTestUser } from './auth.setup';

test.describe('Página de Pomodoro', () => {
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    testUser = generateTestUser();

    // Registrar nuevo usuario
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => localStorage.clear());

    await page.getByLabel(/nombre completo/i).fill(testUser.name);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/contraseña/i).fill(testUser.password);
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    // Esperar redirección al dashboard y navegar a pomodoro
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.goto('/pomodoro');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    
    // Esperar a que la página de pomodoro cargue completamente
    await expect(page.getByRole('heading', { name: 'Técnica Pomodoro' })).toBeVisible({ timeout: 20000 });
  });

  test('debe mostrar el título de la página', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Técnica Pomodoro' })).toBeVisible();
    await expect(page.getByText('Aumenta tu concentración con intervalos de trabajo enfocado')).toBeVisible();
  });

  test('debe mostrar la configuración actual de tiempos', async ({ page }) => {
    // Verificar que muestra la configuración por defecto (25 min trabajo, 5 min descanso)
    await expect(page.getByText(/configuración actual.*min trabajo.*min descanso/i)).toBeVisible();
  });

  test('debe mostrar el temporizador con formato correcto', async ({ page }) => {
    // Verificar que el temporizador está visible con formato MM:SS
    const timer = page.locator('.text-8xl');
    await expect(timer).toBeVisible();
    await expect(timer).toHaveText(/\d{2}:\d{2}/);
  });

  test('debe mostrar los botones de control', async ({ page }) => {
    await expect(page.getByRole('button', { name: /iniciar/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /reiniciar/i })).toBeVisible();
  });

  test('debe mostrar el botón de configuración', async ({ page }) => {
    const settingsButton = page.getByRole('button', { name: /configurar tiempos/i });
    await expect(settingsButton).toBeVisible();
  });

  test('debe mostrar las tarjetas de estadísticas', async ({ page }) => {
    await expect(page.getByText('Pomodoros Hoy')).toBeVisible();
    await expect(page.getByText('Total Sesiones')).toBeVisible();
    await expect(page.getByText('Tiempo Total')).toBeVisible();
  });

  test('debe mostrar la sección informativa sobre Pomodoro', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '¿Qué es la Técnica Pomodoro?' })).toBeVisible();
    await expect(page.getByText(/minutos de trabajo concentrado/i)).toBeVisible();
    await expect(page.getByText(/minutos de descanso/i)).toBeVisible();
  });

  test('debe iniciar y pausar el temporizador', async ({ page }) => {
    // Hacer clic en iniciar
    await page.getByRole('button', { name: /iniciar/i }).click();
    
    // Verificar que el botón cambió a "Pausar"
    await expect(page.getByRole('button', { name: /pausar/i })).toBeVisible();
    
    // El texto debe cambiar a "Sesión de Estudio"
    await expect(page.getByText('Sesión de Estudio')).toBeVisible();

    // Pausar el temporizador
    await page.getByRole('button', { name: /pausar/i }).click();
    
    // Verificar que el botón volvió a "Iniciar"
    await expect(page.getByRole('button', { name: /iniciar/i })).toBeVisible();
  });

  test('debe reiniciar el temporizador', async ({ page }) => {
    // Iniciar el temporizador
    await page.getByRole('button', { name: /iniciar/i }).click();
    await page.waitForTimeout(2000); // Esperar 2 segundos

    // Reiniciar
    await page.getByRole('button', { name: /reiniciar/i }).click();

    // Verificar que el temporizador volvió al inicio (25:00 por defecto)
    const timer = page.locator('.text-8xl');
    await expect(timer).toHaveText(/25:00|24:5\d/); // Puede ser 25:00 o cerca
  });

  test('debe abrir el diálogo de configuración', async ({ page }) => {
    // Clic en el botón de configuración
    await page.getByRole('button', { name: /configurar tiempos/i }).click();

    // Verificar que el diálogo se abre
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /configuración/i })).toBeVisible();
  });

  test('debe mostrar selector de tareas cuando no está activo', async ({ page }) => {
    // Verificar que el selector de tareas está visible
    await expect(page.getByText('Selecciona una tarea')).toBeVisible();
    await expect(page.getByText('Elige la tarea en la que trabajarás')).toBeVisible();
  });
});

test.describe('Pomodoro con Tareas', () => {
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    testUser = generateTestUser();

    // Registrar nuevo usuario
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => localStorage.clear());

    await page.getByLabel(/nombre completo/i).fill(testUser.name);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/contraseña/i).fill(testUser.password);
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  test('debe mostrar tareas en el selector', async ({ page }) => {
    // Crear materia primero
    await page.goto('/subjects');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Materias' })).toBeVisible({ timeout: 20000 });

    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Programación');
    await page.locator('#assignedTeacher').fill('Prof. Dev');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(2000);

    // Crear tarea
    await page.goto('/tasks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Tareas' })).toBeVisible({ timeout: 20000 });

    await page.getByRole('button', { name: /nueva tarea/i }).first().click();
    await page.locator('#title').fill('Tarea Pomodoro Test');
    await page.locator('#description').fill('Descripción de prueba');

    const dialog = page.getByRole('dialog');
    const subjectSelect = dialog.locator('button').filter({ hasText: /selecciona una materia/i });
    await subjectSelect.click();
    await page.getByRole('option', { name: /programación/i }).click();

    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await page.locator('#start_date').fill(today);
    await page.locator('#delivery_date').fill(nextWeek);

    await page.getByRole('button', { name: /^crear$/i }).click();
    await page.waitForTimeout(2000);

    // Ir a Pomodoro
    await page.goto('/pomodoro');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Técnica Pomodoro' })).toBeVisible({ timeout: 20000 });

    // Abrir selector de tareas
    const taskSelect = page.locator('button').filter({ hasText: /elige la tarea/i });
    await taskSelect.click();

    // Verificar que la tarea aparece en el selector
    await expect(page.getByRole('option', { name: /tarea pomodoro test/i })).toBeVisible();
  });

  test('debe seleccionar una tarea para el pomodoro', async ({ page }) => {
    // Crear materia y tarea
    await page.goto('/subjects');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Materias' })).toBeVisible({ timeout: 20000 });

    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Matemáticas');
    await page.locator('#assignedTeacher').fill('Prof. Calc');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(2000);

    await page.goto('/tasks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Tareas' })).toBeVisible({ timeout: 20000 });

    await page.getByRole('button', { name: /nueva tarea/i }).first().click();
    await page.locator('#title').fill('Ejercicios de Cálculo');
    await page.locator('#description').fill('Resolver ejercicios');

    const dialog = page.getByRole('dialog');
    const subjectSelect = dialog.locator('button').filter({ hasText: /selecciona una materia/i });
    await subjectSelect.click();
    await page.getByRole('option', { name: /matemáticas/i }).click();

    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await page.locator('#start_date').fill(today);
    await page.locator('#delivery_date').fill(nextWeek);

    await page.getByRole('button', { name: /^crear$/i }).click();
    await page.waitForTimeout(2000);

    // Ir a Pomodoro
    await page.goto('/pomodoro');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Técnica Pomodoro' })).toBeVisible({ timeout: 20000 });

    // Seleccionar la tarea
    const taskSelect = page.locator('button').filter({ hasText: /elige la tarea/i });
    await taskSelect.click();
    await page.getByRole('option', { name: /ejercicios de cálculo/i }).click();

    // Verificar que la tarea está seleccionada
    await expect(page.locator('button').filter({ hasText: /ejercicios de cálculo/i })).toBeVisible();
  });

  test('debe cambiar la configuración de tiempos', async ({ page }) => {
    await page.goto('/pomodoro');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Técnica Pomodoro' })).toBeVisible({ timeout: 20000 });

    // Abrir configuración
    await page.getByRole('button', { name: /configurar tiempos/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Cambiar tiempo de trabajo a 30 minutos
    const workTimeInput = page.locator('input[type="number"]').first();
    await workTimeInput.clear();
    await workTimeInput.fill('30');

    // Guardar
    await page.getByRole('button', { name: /guardar/i }).click();
    await page.waitForTimeout(1000);

    // Verificar que se actualizó la configuración
    await expect(page.getByText(/30 min trabajo/i)).toBeVisible();
  });
});
