import { test, expect } from '@playwright/test';
import { generateTestUser } from './auth.setup';

test.describe('Página de Tareas', () => {
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

    // Esperar redirección al dashboard y navegar a tareas
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.goto('/tasks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    
    // Esperar a que la página de tareas cargue completamente
    await expect(page.getByRole('heading', { name: 'Mis Tareas' })).toBeVisible({ timeout: 20000 });
  });

  test('debe mostrar el título de la página', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Mis Tareas' })).toBeVisible();
    await expect(page.getByText('Organiza y monitorea tus tareas académicas')).toBeVisible();
  });

  test('debe mostrar el estado vacío cuando no hay tareas', async ({ page }) => {
    await expect(page.getByText('No tienes tareas registradas')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Comienza agregando tu primera tarea')).toBeVisible();
  });

  test('debe mostrar el botón "Nueva Tarea" en la parte superior', async ({ page }) => {
    const newTaskButton = page.getByRole('button', { name: /nueva tarea/i }).first();
    await expect(newTaskButton).toBeVisible({ timeout: 10000 });
  });

  test('debe mostrar el botón "Crear Primera Tarea" en estado vacío', async ({ page }) => {
    await expect(page.getByText('No tienes tareas registradas')).toBeVisible({ timeout: 10000 });
    const createButton = page.getByRole('button', { name: 'Crear Primera Tarea' });
    await expect(createButton).toBeVisible();
  });

  test('debe abrir el formulario al hacer clic en "Nueva Tarea"', async ({ page }) => {
    await page.getByRole('button', { name: /nueva tarea/i }).first().click();
    
    // Verificar que el diálogo se abre
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /nueva tarea/i })).toBeVisible();
  });

  test('debe mostrar campos del formulario de tarea', async ({ page }) => {
    await page.getByRole('button', { name: /nueva tarea/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Verificar campos del formulario
    await expect(page.locator('#title')).toBeVisible();
    await expect(page.locator('#description')).toBeVisible();
    await expect(page.locator('#start_date')).toBeVisible();
    await expect(page.locator('#delivery_date')).toBeVisible();
  });

  test('debe cerrar el formulario con el botón Cancelar', async ({ page }) => {
    await page.getByRole('button', { name: /nueva tarea/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: /cancelar/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('debe mostrar el filtro por materia', async ({ page }) => {
    await expect(page.getByText('Filtrar por materia:')).toBeVisible();
    const selectTrigger = page.locator('button').filter({ hasText: /todas las materias/i });
    await expect(selectTrigger).toBeVisible();
  });
});

test.describe('Tareas con Datos', () => {
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

  test('debe crear una materia y luego una tarea', async ({ page }) => {
    // Primero crear una materia
    await page.goto('/subjects');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Materias' })).toBeVisible({ timeout: 20000 });
    
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Matemáticas');
    await page.locator('#assignedTeacher').fill('Prof. García');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(2000);

    // Ir a tareas
    await page.goto('/tasks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Tareas' })).toBeVisible({ timeout: 20000 });

    // Crear tarea
    await page.getByRole('button', { name: /nueva tarea/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.locator('#title').fill('Tarea de Prueba E2E');
    await page.locator('#description').fill('Descripción de la tarea de prueba');

    // Seleccionar materia
    const dialog = page.getByRole('dialog');
    const subjectSelect = dialog.locator('button').filter({ hasText: /selecciona una materia/i });
    await subjectSelect.click();
    await page.getByRole('option', { name: /matemáticas/i }).click();

    // Establecer fechas
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await page.locator('#start_date').fill(today);
    await page.locator('#delivery_date').fill(nextWeek);

    // Guardar
    await page.getByRole('button', { name: /^crear$/i }).click();
    await page.waitForTimeout(2000);

    // Verificar que la tarea aparece
    await expect(page.getByText('Tarea de Prueba E2E')).toBeVisible({ timeout: 10000 });
  });

  test('debe mostrar las tabs de estados', async ({ page }) => {
    // Crear materia y tarea primero
    await page.goto('/subjects');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Materias' })).toBeVisible({ timeout: 20000 });
    
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Física');
    await page.locator('#assignedTeacher').fill('Dr. López');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(2000);

    await page.goto('/tasks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Tareas' })).toBeVisible({ timeout: 20000 });

    // Crear tarea
    await page.getByRole('button', { name: /nueva tarea/i }).first().click();
    await page.locator('#title').fill('Tarea Tabs Test');
    await page.locator('#description').fill('Descripción');

    const dialog = page.getByRole('dialog');
    const subjectSelect = dialog.locator('button').filter({ hasText: /selecciona una materia/i });
    await subjectSelect.click();
    await page.getByRole('option', { name: /física/i }).click();

    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await page.locator('#start_date').fill(today);
    await page.locator('#delivery_date').fill(nextWeek);

    await page.getByRole('button', { name: /^crear$/i }).click();
    await page.waitForTimeout(2000);

    // Verificar que las tabs aparecen
    await expect(page.getByRole('tab', { name: /todas/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /pendientes/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /en progreso/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /completadas/i })).toBeVisible();
  });

  test('debe editar una tarea existente', async ({ page }) => {
    // Crear materia y tarea
    await page.goto('/subjects');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Materias' })).toBeVisible({ timeout: 20000 });
    
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Química');
    await page.locator('#assignedTeacher').fill('Dra. Martínez');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(2000);

    await page.goto('/tasks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Tareas' })).toBeVisible({ timeout: 20000 });

    await page.getByRole('button', { name: /nueva tarea/i }).first().click();
    await page.locator('#title').fill('Tarea Original');
    await page.locator('#description').fill('Descripción original');

    const dialog = page.getByRole('dialog');
    const subjectSelect = dialog.locator('button').filter({ hasText: /selecciona una materia/i });
    await subjectSelect.click();
    await page.getByRole('option', { name: /química/i }).click();

    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await page.locator('#start_date').fill(today);
    await page.locator('#delivery_date').fill(nextWeek);

    await page.getByRole('button', { name: /^crear$/i }).click();
    await page.waitForTimeout(2000);

    // Hacer hover sobre la tarea para mostrar botones
    const taskCard = page.locator('text=Tarea Original').first();
    await taskCard.hover();

    // Clic en editar
    await page.getByRole('button', { name: /editar/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Modificar título
    await page.locator('#title').clear();
    await page.locator('#title').fill('Tarea Editada');

    await page.getByRole('button', { name: /actualizar/i }).click();
    await page.waitForTimeout(2000);

    // Verificar cambio
    await expect(page.getByText('Tarea Editada')).toBeVisible({ timeout: 10000 });
  });

  test('debe eliminar una tarea', async ({ page }) => {
    // Crear materia y tarea
    await page.goto('/subjects');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Materias' })).toBeVisible({ timeout: 20000 });
    
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Historia');
    await page.locator('#assignedTeacher').fill('Lic. Pérez');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(2000);

    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Tareas' })).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: /nueva tarea/i }).first().click();
    await page.locator('#title').fill('Tarea para Eliminar');
    await page.locator('#description').fill('Esta tarea será eliminada');

    const dialog = page.getByRole('dialog');
    const subjectSelect = dialog.locator('button').filter({ hasText: /selecciona una materia/i });
    await subjectSelect.click();
    await page.getByRole('option', { name: /historia/i }).click();

    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await page.locator('#start_date').fill(today);
    await page.locator('#delivery_date').fill(nextWeek);

    await page.getByRole('button', { name: /^crear$/i }).click();
    await page.waitForTimeout(2000);

    // Verificar que existe
    await expect(page.getByText('Tarea para Eliminar')).toBeVisible({ timeout: 10000 });

    // Hacer hover sobre la tarea
    const taskCard = page.locator('text=Tarea para Eliminar').first();
    await taskCard.hover();

    // Clic en eliminar
    await page.getByRole('button', { name: /eliminar/i }).first().click();

    // Confirmar eliminación
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await expect(page.getByText('¿Estás seguro?')).toBeVisible();
    await page.getByRole('button', { name: /^eliminar$/i }).click();
    await page.waitForTimeout(2000);

    // Verificar que se eliminó
    await expect(page.getByText('Tarea para Eliminar')).not.toBeVisible();
  });

  test('debe marcar tarea como completada', async ({ page }) => {
    // Crear materia y tarea
    await page.goto('/subjects');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Materias' })).toBeVisible({ timeout: 20000 });
    
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Biología');
    await page.locator('#assignedTeacher').fill('Dr. Ramírez');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(2000);

    await page.goto('/tasks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Tareas' })).toBeVisible({ timeout: 20000 });

    await page.getByRole('button', { name: /nueva tarea/i }).first().click();
    await page.locator('#title').fill('Tarea Completar');
    await page.locator('#description').fill('Esta tarea será completada');

    const dialog = page.getByRole('dialog');
    const subjectSelect = dialog.locator('button').filter({ hasText: /selecciona una materia/i });
    await subjectSelect.click();
    await page.getByRole('option', { name: /biología/i }).click();

    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await page.locator('#start_date').fill(today);
    await page.locator('#delivery_date').fill(nextWeek);

    await page.getByRole('button', { name: /^crear$/i }).click();
    await page.waitForTimeout(2000);

    // Verificar que existe
    await expect(page.getByText('Tarea Completar')).toBeVisible({ timeout: 10000 });

    // Marcar como completada usando el checkbox
    const checkbox = page.locator('button[role="checkbox"]').first();
    await checkbox.click();
    await page.waitForTimeout(1000);

    // Verificar que el contador de completadas aumentó
    await expect(page.getByRole('tab', { name: /completadas \(1\)/i })).toBeVisible();
  });

  test('debe filtrar tareas por materia', async ({ page }) => {
    // Crear dos materias
    await page.goto('/subjects');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Materias' })).toBeVisible({ timeout: 20000 });
    
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Geografía');
    await page.locator('#assignedTeacher').fill('Lic. Torres');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Economía');
    await page.locator('#assignedTeacher').fill('Dr. Méndez');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(2000);

    // Ir a tareas y crear una tarea de Geografía
    await page.goto('/tasks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Mis Tareas' })).toBeVisible({ timeout: 20000 });

    await page.getByRole('button', { name: /nueva tarea/i }).first().click();
    await page.locator('#title').fill('Tarea Geografía');
    await page.locator('#description').fill('Tarea de geografía');

    const dialog = page.getByRole('dialog');
    const subjectSelect = dialog.locator('button').filter({ hasText: /selecciona una materia/i });
    await subjectSelect.click();
    await page.getByRole('option', { name: /geografía/i }).click();

    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await page.locator('#start_date').fill(today);
    await page.locator('#delivery_date').fill(nextWeek);

    await page.getByRole('button', { name: /^crear$/i }).click();
    await page.waitForTimeout(2000);

    // Verificar tarea creada
    await expect(page.getByText('Tarea Geografía')).toBeVisible({ timeout: 10000 });

    // Usar el filtro para seleccionar Geografía
    const filterSelect = page.locator('button').filter({ hasText: /todas las materias/i });
    await filterSelect.click();
    await page.getByRole('option', { name: /geografía/i }).click();

    // Verificar que se muestra la tarea de geografía
    await expect(page.getByText('Tarea Geografía')).toBeVisible();
    await expect(page.getByText('1 tarea')).toBeVisible();
  });
});
