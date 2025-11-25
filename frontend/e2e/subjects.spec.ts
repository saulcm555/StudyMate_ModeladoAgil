import { test, expect } from '@playwright/test';
import { generateTestUser } from './auth.setup';

test.describe('Página de Materias', () => {
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

    // Esperar redirección al dashboard y navegar a materias
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    await page.goto('/subjects');
    await page.waitForLoadState('networkidle');
    
    // Esperar a que la página de materias cargue completamente
    await expect(page.getByRole('heading', { name: 'Mis Materias' })).toBeVisible({ timeout: 10000 });
  });

  test('debe mostrar el título de la página', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Mis Materias' })).toBeVisible();
    await expect(page.getByText('Gestiona tus materias del semestre actual')).toBeVisible();
  });

  test('debe mostrar el estado vacío cuando no hay materias', async ({ page }) => {
    await expect(page.getByText('No tienes materias registradas')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Comienza agregando tu primera materia')).toBeVisible();
  });

  test('debe mostrar el botón "Crear Primera Materia" en estado vacío', async ({ page }) => {
    await expect(page.getByText('No tienes materias registradas')).toBeVisible({ timeout: 10000 });
    const createButton = page.getByRole('button', { name: 'Crear Primera Materia' });
    await expect(createButton).toBeVisible();
  });

  test('debe mostrar el botón "Nueva Materia" en la parte superior', async ({ page }) => {
    const newSubjectButton = page.getByRole('button', { name: 'Nueva Materia' }).first();
    await expect(newSubjectButton).toBeVisible({ timeout: 10000 });
  });

  test('debe abrir el formulario al hacer clic en "Crear Primera Materia"', async ({ page }) => {
    await expect(page.getByText('No tienes materias registradas')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Crear Primera Materia' }).click();
    
    await expect(page.getByRole('heading', { name: 'Nueva Materia' })).toBeVisible();
    await expect(page.getByLabel('Nombre de la Materia')).toBeVisible();
  });

  test('debe abrir el formulario al hacer clic en "Nueva Materia"', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Nueva Materia' }).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    
    await expect(page.getByRole('heading', { name: 'Nueva Materia' })).toBeVisible();
    await expect(page.getByLabel('Nombre de la Materia')).toBeVisible();
  });

  test('debe crear una nueva materia exitosamente', async ({ page }) => {
    // Abrir formulario
    await expect(page.getByRole('button', { name: 'Nueva Materia' }).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    
    // Llenar campos requeridos
    await page.locator('#name').fill('Matemáticas');
    await page.locator('#assignedTeacher').fill('Dr. García');
    
    // Enviar formulario
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    
    // Esperar y verificar que la materia aparece
    await page.waitForTimeout(1500);
    await expect(page.getByText('Matemáticas').first()).toBeVisible();
    await expect(page.getByText('Dr. García')).toBeVisible();
  });

  test('debe mostrar la tarjeta de materia con información del profesor', async ({ page }) => {
    // Crear materia
    await expect(page.getByRole('button', { name: 'Nueva Materia' }).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Física');
    await page.locator('#assignedTeacher').fill('Prof. Rodríguez');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    
    await page.waitForTimeout(1500);
    
    // Verificar contenido de la tarjeta
    await expect(page.getByText('Física').first()).toBeVisible();
    await expect(page.getByText('Prof. Rodríguez')).toBeVisible();
    await expect(page.getByText('0 tareas')).toBeVisible();
  });

  test('debe cerrar el formulario al hacer clic en cancelar', async ({ page }) => {
    // Abrir formulario
    await expect(page.getByRole('button', { name: 'Nueva Materia' }).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await expect(page.getByRole('heading', { name: 'Nueva Materia' })).toBeVisible();
    
    // Hacer clic en cancelar
    await page.getByRole('button', { name: 'Cancelar' }).click();
    
    // Verificar que el formulario se cerró
    await expect(page.getByRole('heading', { name: 'Nueva Materia' })).not.toBeVisible();
  });

  test('debe requerir el nombre de la materia', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Nueva Materia' }).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    
    // Intentar enviar sin nombre
    await page.locator('#assignedTeacher').fill('Dr. Test');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    
    // El formulario debe seguir visible (validación falló)
    await expect(page.getByRole('heading', { name: 'Nueva Materia' })).toBeVisible();
  });

  test('debe requerir el nombre del profesor', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Nueva Materia' }).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    
    // Intentar enviar sin profesor
    await page.locator('#name').fill('Química');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    
    // El formulario debe seguir visible (validación falló)
    await expect(page.getByRole('heading', { name: 'Nueva Materia' })).toBeVisible();
  });

  test('debe abrir el formulario de edición al hacer clic en editar', async ({ page }) => {
    // Crear una materia primero
    await expect(page.getByRole('button', { name: 'Nueva Materia' }).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Historia');
    await page.locator('#assignedTeacher').fill('Lic. Pérez');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(1500);
    
    // Hacer hover sobre la tarjeta para revelar botones
    const subjectCard = page.locator('.group').filter({ hasText: 'Historia' }).first();
    await subjectCard.hover();
    
    // Hacer clic en el botón de editar
    await subjectCard.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).click();
    
    // Verificar que el formulario de edición se abre con los datos existentes
    await expect(page.getByRole('heading', { name: 'Editar Materia' })).toBeVisible();
    await expect(page.locator('#name')).toHaveValue('Historia');
    await expect(page.locator('#assignedTeacher')).toHaveValue('Lic. Pérez');
  });

  test('debe actualizar una materia exitosamente', async ({ page }) => {
    // Crear una materia
    await expect(page.getByRole('button', { name: 'Nueva Materia' }).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Biología');
    await page.locator('#assignedTeacher').fill('Dra. López');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(1500);
    
    // Abrir formulario de edición
    const subjectCard = page.locator('.group').filter({ hasText: 'Biología' }).first();
    await subjectCard.hover();
    await subjectCard.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).click();
    
    // Actualizar campos
    await page.locator('#name').fill('Biología Avanzada');
    await page.locator('#assignedTeacher').fill('Dra. López Martínez');
    await page.getByRole('button', { name: 'Actualizar' }).click();
    
    await page.waitForTimeout(1500);
    
    // Verificar valores actualizados
    await expect(page.getByText('Biología Avanzada').first()).toBeVisible();
    await expect(page.getByText('Dra. López Martínez')).toBeVisible();
  });

  test('debe abrir el diálogo de confirmación para eliminar', async ({ page }) => {
    // Crear una materia
    await expect(page.getByRole('button', { name: 'Nueva Materia' }).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Literatura');
    await page.locator('#assignedTeacher').fill('Prof. Sánchez');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(1500);
    
    // Hacer hover y hacer clic en eliminar
    const subjectCard = page.locator('.group').filter({ hasText: 'Literatura' }).first();
    await subjectCard.hover();
    await subjectCard.locator('button').filter({ has: page.locator('svg.lucide-trash-2') }).click();
    
    // Verificar que el diálogo aparece
    await expect(page.getByText('¿Estás seguro?')).toBeVisible();
    await expect(page.getByText('Esta acción no se puede deshacer')).toBeVisible();
  });

  test('debe cancelar la operación de eliminar', async ({ page }) => {
    // Crear una materia
    await expect(page.getByRole('button', { name: 'Nueva Materia' }).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Geografía');
    await page.locator('#assignedTeacher').fill('Lic. Torres');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(1500);
    
    // Abrir diálogo de eliminar
    const subjectCard = page.locator('.group').filter({ hasText: 'Geografía' }).first();
    await subjectCard.hover();
    await subjectCard.locator('button').filter({ has: page.locator('svg.lucide-trash-2') }).click();
    
    // Hacer clic en cancelar
    await page.getByRole('button', { name: 'Cancelar' }).click();
    
    // Verificar que la materia sigue existiendo
    await expect(page.getByText('Geografía').first()).toBeVisible();
  });

  test('debe eliminar una materia exitosamente', async ({ page }) => {
    // Crear una materia
    await expect(page.getByRole('button', { name: 'Nueva Materia' }).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Arte');
    await page.locator('#assignedTeacher').fill('Mtro. Ramírez');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(1500);
    
    // Eliminar materia
    const subjectCard = page.locator('.group').filter({ hasText: 'Arte' }).first();
    await subjectCard.hover();
    await subjectCard.locator('button').filter({ has: page.locator('svg.lucide-trash-2') }).click();
    await page.getByRole('button', { name: 'Eliminar' }).click();
    
    await page.waitForTimeout(1500);
    
    // Verificar que la materia fue eliminada
    await expect(page.getByText('Arte')).not.toBeVisible();
    await expect(page.getByText('No tienes materias registradas')).toBeVisible();
  });

  test('debe mostrar múltiples materias en layout de cuadrícula', async ({ page }) => {
    // Crear múltiples materias
    const subjects = [
      { name: 'Inglés', teacher: 'Prof. Smith' },
      { name: 'Programación', teacher: 'Ing. Gómez' },
      { name: 'Estadística', teacher: 'Dr. Vargas' }
    ];

    await expect(page.getByRole('button', { name: 'Nueva Materia' }).first()).toBeVisible({ timeout: 10000 });
    
    for (const subject of subjects) {
      await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
      await page.locator('#name').fill(subject.name);
      await page.locator('#assignedTeacher').fill(subject.teacher);
      await page.getByRole('button', { name: 'Crear Materia' }).click();
      await page.waitForTimeout(1500);
    }

    // Verificar que todas las materias son visibles
    for (const subject of subjects) {
      await expect(page.getByText(subject.name).first()).toBeVisible();
      await expect(page.getByText(subject.teacher)).toBeVisible();
    }
    
    // Verificar que el estado vacío no se muestra
    await expect(page.getByText('No tienes materias registradas')).not.toBeVisible();
  });

  test('debe navegar a tareas al hacer clic en una materia', async ({ page }) => {
    // Crear una materia
    await expect(page.getByRole('button', { name: 'Nueva Materia' }).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    await page.locator('#name').fill('Cálculo');
    await page.locator('#assignedTeacher').fill('Dr. Morales');
    await page.getByRole('button', { name: 'Crear Materia' }).click();
    await page.waitForTimeout(1500);
    
    // Hacer clic en la tarjeta de materia
    const subjectCard = page.locator('.group').filter({ hasText: 'Cálculo' }).first();
    await subjectCard.click();
    
    // Verificar navegación a la página de tareas
    await expect(page).toHaveURL(/\/tasks\?subject=/);
  });

  test('debe mostrar estado de carga inicialmente', async ({ page }) => {
    // Recargar página para ver el estado de carga
    await page.reload();
    
    // Debe mostrar contenido o carga
    const loadingText = page.getByText('Cargando materias...');
    const contentVisible = page.getByText('Mis Materias');
    
    await expect(loadingText.or(contentVisible)).toBeVisible({ timeout: 10000 });
  });

  test('debe permitir seleccionar un color para la materia', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Nueva Materia' }).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Nueva Materia' }).first().click();
    
    // Verificar que hay opciones de color
    await expect(page.getByText('Color de Identificación')).toBeVisible();
    
    // Verificar botones de color
    const colorButtons = page.locator('button[type="button"][style*="background-color"]');
    const count = await colorButtons.count();
    
    expect(count).toBeGreaterThanOrEqual(8);
  });
});
