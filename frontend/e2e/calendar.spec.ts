import { test, expect } from '@playwright/test';
import { generateTestUser } from './auth.setup';

test.describe('Página de Calendario', () => {
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    testUser = generateTestUser();

    // Registrar nuevo usuario
    await page.goto('/register');
    await page.evaluate(() => localStorage.clear());

    await page.getByLabel(/nombre completo/i).fill(testUser.name);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/contraseña/i).fill(testUser.password);
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    // Esperar redirección al dashboard y navegar a calendario
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.goto('/calendar');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    
    // Esperar a que la página de calendario cargue completamente
    await expect(page.getByRole('heading', { name: 'Calendario Académico' })).toBeVisible({ timeout: 20000 });
  });

  test('debe mostrar el título de la página', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Calendario Académico' })).toBeVisible();
    await expect(page.getByText('Visualiza todas tus fechas de entrega')).toBeVisible();
  });

  test('debe mostrar el selector de filtro por materia', async ({ page }) => {
    // Verificar que existe el selector de materia
    const selectTrigger = page.locator('button').filter({ hasText: /todas las materias|filtrar por materia/i });
    await expect(selectTrigger).toBeVisible();
  });

  test('debe mostrar la sección "Tareas del día"', async ({ page }) => {
    await expect(page.getByText('Tareas del día')).toBeVisible();
  });

  test('debe mostrar la sección "Próximas Entregas"', async ({ page }) => {
    await expect(page.getByText('Próximas Entregas')).toBeVisible();
  });

  test('debe mostrar el selector de fecha', async ({ page }) => {
    // Verificar que existe el input de tipo date
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeVisible();
  });

  test('debe mostrar mensaje cuando no hay tareas para el día seleccionado', async ({ page }) => {
    // Usuario nuevo sin tareas debería ver el mensaje de vacío
    await expect(page.getByText('No hay tareas para este día')).toBeVisible();
  });

  test('debe mostrar mensaje cuando no hay tareas pendientes', async ({ page }) => {
    // Usuario nuevo sin tareas debería ver el mensaje de vacío en próximas entregas
    await expect(page.getByText('No hay tareas pendientes')).toBeVisible();
  });

  test('debe permitir cambiar la fecha seleccionada', async ({ page }) => {
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeVisible();
    
    // Cambiar la fecha
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    await dateInput.fill(tomorrowStr);
    
    // Verificar que el valor cambió
    await expect(dateInput).toHaveValue(tomorrowStr);
  });

  test('debe abrir el selector de materias al hacer clic', async ({ page }) => {
    // Hacer clic en el selector
    const selectTrigger = page.locator('button').filter({ hasText: /todas las materias/i }).first();
    await expect(selectTrigger).toBeVisible({ timeout: 10000 });
    await selectTrigger.click();
    
    // Verificar que se abre el menú con la opción "Todas las materias"
    await expect(page.getByRole('option', { name: 'Todas las materias' })).toBeVisible();
  });

  test('debe tener layout con tarjetas', async ({ page }) => {
    // Verificar que hay tarjetas (Cards)
    const cards = page.locator('[class*="card"]');
    await expect(cards.first()).toBeVisible();
  });
});

test.describe('Calendario con Datos', () => {
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    testUser = generateTestUser();

    // Registrar nuevo usuario
    await page.goto('/register');
    await page.evaluate(() => localStorage.clear());

    await page.getByLabel(/nombre completo/i).fill(testUser.name);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/contraseña/i).fill(testUser.password);
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  test('debe mostrar materias creadas en el filtro', async ({ page }) => {
    // Crear una materia
    await page.goto('/subjects');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Materias' })).toBeVisible({ timeout: 20000 });
    
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Matemáticas Test');
    await page.locator('#assignedTeacher').fill('Dr. García');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(2000);

    // Ir al calendario
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Calendario Académico' })).toBeVisible({ timeout: 20000 });

    // Abrir el selector de materias
    const selectTrigger = page.locator('button').filter({ hasText: /todas las materias/i }).first();
    await selectTrigger.click();

    // Verificar que la materia creada aparece en el filtro
    await expect(page.getByRole('option', { name: /matemáticas test/i })).toBeVisible();
  });

  test('debe crear tarea y verla en el calendario', async ({ page }) => {
    // Crear una materia primero
    await page.goto('/subjects');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Materias' })).toBeVisible({ timeout: 20000 });
    
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Física');
    await page.locator('#assignedTeacher').fill('Prof. Martínez');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(2000);

    // Ir a tareas y crear una tarea
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Tareas' })).toBeVisible({ timeout: 20000 });
    
    // Clic en Nueva Tarea
    await page.getByRole('button', { name: /nueva tarea/i }).first().click();
    await expect(page.getByRole('heading', { name: /nueva tarea/i })).toBeVisible();
    
    // Llenar formulario
    await page.locator('#title').fill('Tarea Calendario E2E');
    await page.locator('#description').fill('Descripción de prueba');
    
    // Seleccionar materia - usar el selector DENTRO del diálogo
    const dialog = page.getByRole('dialog');
    const subjectSelect = dialog.locator('button').filter({ hasText: /selecciona una materia/i });
    await subjectSelect.click();
    await page.getByRole('option', { name: /física/i }).click();
    
    // Establecer fecha de entrega (hoy)
    const today = new Date().toISOString().split('T')[0];
    await page.locator('#delivery_date').fill(today);
    
    // Guardar (el botón es "Crear" no "Crear Tarea")
    await page.getByRole('button', { name: /^crear$/i }).click();
    await page.waitForTimeout(2000);

    // Ir al calendario
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Calendario Académico' })).toBeVisible({ timeout: 20000 });

    // Verificar que la tarea aparece
    await expect(page.getByText('Tarea Calendario E2E').first()).toBeVisible({ timeout: 10000 });
  });

  test('debe abrir diálogo de detalles al hacer clic en tarea', async ({ page }) => {
    // Crear materia y tarea
    await page.goto('/subjects');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Materias' })).toBeVisible({ timeout: 20000 });
    
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Química');
    await page.locator('#assignedTeacher').fill('Dra. López');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(2000);

    // Crear tarea
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Tareas' })).toBeVisible({ timeout: 20000 });
    
    await page.getByRole('button', { name: /nueva tarea/i }).first().click();
    await page.locator('#title').fill('Tarea para Dialog');
    await page.locator('#description').fill('Esta es una descripción detallada');
    
    // Seleccionar materia dentro del diálogo
    const dialog = page.getByRole('dialog');
    const subjectSelect = dialog.locator('button').filter({ hasText: /selecciona una materia/i });
    await subjectSelect.click();
    await page.getByRole('option', { name: /química/i }).click();
    
    const today = new Date().toISOString().split('T')[0];
    await page.locator('#delivery_date').fill(today);
    
    await page.getByRole('button', { name: /^crear$/i }).click();
    await page.waitForTimeout(2000);

    // Ir al calendario
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Calendario Académico' })).toBeVisible({ timeout: 20000 });

    // Hacer clic en la tarea
    const taskElement = page.getByText('Tarea para Dialog').first();
    await expect(taskElement).toBeVisible({ timeout: 10000 });
    await taskElement.click();

    // Verificar que se abre el diálogo
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Esta es una descripción detallada')).toBeVisible();
  });

  test('debe cerrar el diálogo con Escape', async ({ page }) => {
    // Crear materia y tarea
    await page.goto('/subjects');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Materias' })).toBeVisible({ timeout: 20000 });
    
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Historia');
    await page.locator('#assignedTeacher').fill('Lic. Pérez');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(2000);

    // Crear tarea
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Tareas' })).toBeVisible({ timeout: 20000 });
    
    await page.getByRole('button', { name: /nueva tarea/i }).first().click();
    await page.locator('#title').fill('Tarea Cerrar Dialog');
    await page.locator('#description').fill('Descripción de prueba');
    
    // Seleccionar materia dentro del diálogo
    const dialog = page.getByRole('dialog');
    const subjectSelect = dialog.locator('button').filter({ hasText: /selecciona una materia/i });
    await subjectSelect.click();
    await page.getByRole('option', { name: /historia/i }).click();
    
    const today = new Date().toISOString().split('T')[0];
    await page.locator('#delivery_date').fill(today);
    
    await page.getByRole('button', { name: /^crear$/i }).click();
    await page.waitForTimeout(2000);

    // Ir al calendario
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Calendario Académico' })).toBeVisible({ timeout: 20000 });

    // Hacer clic en la tarea para abrir diálogo
    const taskElement = page.getByText('Tarea Cerrar Dialog').first();
    await expect(taskElement).toBeVisible({ timeout: 10000 });
    await taskElement.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Cerrar con Escape
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('debe filtrar tareas por materia seleccionada', async ({ page }) => {
    // Crear dos materias
    await page.goto('/subjects');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Materias' })).toBeVisible({ timeout: 20000 });
    
    // Primera materia
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Biología');
    await page.locator('#assignedTeacher').fill('Dr. Ramírez');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(2000);

    // Segunda materia
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Geografía');
    await page.locator('#assignedTeacher').fill('Lic. Torres');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(2000);

    // Ir al calendario y verificar filtro
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Calendario Académico' })).toBeVisible({ timeout: 20000 });

    // Abrir selector
    const selectTrigger = page.locator('button').filter({ hasText: /todas las materias/i }).first();
    await selectTrigger.click();

    // Verificar que ambas materias aparecen
    await expect(page.getByRole('option', { name: /biología/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /geografía/i })).toBeVisible();

    // Seleccionar una materia específica
    await page.getByRole('option', { name: /biología/i }).click();
    
    // Verificar que el filtro cambió
    const filterButton = page.locator('button').filter({ hasText: /biología/i });
    await expect(filterButton).toBeVisible();
  });
});

test.describe('Calendario - Estados de carga', () => {
  test('debe mostrar estado de carga o contenido', async ({ page }) => {
    const testUser = generateTestUser();

    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => localStorage.clear());

    await page.getByLabel(/nombre completo/i).fill(testUser.name);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/contraseña/i).fill(testUser.password);
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');

    // Debe mostrar el contenido o el estado de carga
    const loadingText = page.getByText('Cargando calendario...');
    const contentVisible = page.getByText('Calendario Académico');
    
    await expect(loadingText.or(contentVisible)).toBeVisible({ timeout: 20000 });
  });
});
