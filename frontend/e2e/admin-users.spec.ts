import { test, expect, request as playwrightRequest } from '@playwright/test';
import { generateTestUser } from './auth.setup';

// Genera un timestamp único para este run de tests
const testRunId = Date.now();

// Función para crear un usuario admin directamente via API
async function createAdminUser() {
  const adminUser = {
    name: `Admin Test ${testRunId}`,
    email: `admin.test.${testRunId}@studymate.com`,
    password: 'admin123456',
  };

  const apiContext = await playwrightRequest.newContext({
    baseURL: 'http://localhost:3000',
  });

  try {
    // Primero crear el usuario vía registro normal
    const registerResponse = await apiContext.post('/auth/register', {
      data: adminUser,
    });

    if (registerResponse.ok()) {
      const data = await registerResponse.json();
      // Guardar el token para después actualizar el rol
      return {
        ...adminUser,
        studentId: data.user.studentId,
        token: data.token,
      };
    }
  } catch (error) {
    console.log('Error creating admin user:', error);
  } finally {
    await apiContext.dispose();
  }

  return null;
}

// ===== TESTS DE ACCESO (No requieren admin) =====
test.describe('Página de Admin Users - Control de Acceso', () => {
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    testUser = generateTestUser();

    // Registrar nuevo usuario normal (no admin)
    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => localStorage.clear());

    await page.getByLabel(/nombre completo/i).fill(testUser.name);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/contraseña/i).fill(testUser.password);
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  test('usuario normal no debe poder acceder a /admin/users', async ({ page }) => {
    // Intentar navegar directamente a la página de admin
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Debe redirigir al dashboard porque no es admin
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('usuario normal no debe ver enlace a admin en el sidebar', async ({ page }) => {
    // Verificar que no existe el link de admin en el sidebar
    const adminLink = page.getByRole('link', { name: /administrar usuarios/i });
    await expect(adminLink).not.toBeVisible();
  });

  test('usuario no autenticado debe redirigir a login', async ({ page }) => {
    // Limpiar sesión
    await page.evaluate(() => localStorage.clear());
    
    // Intentar navegar a admin
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Debe redirigir al login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});

// ===== TESTS DE FUNCIONALIDAD (Requieren admin existente) =====
// Nota: Estos tests requieren un usuario admin en la base de datos
// Se puede crear manualmente o con un script de seed
test.describe('Página de Admin Users - Funcionalidad Admin', () => {
  // Credenciales del usuario admin (deben existir en la base de datos con role = 'Admin')
  // Puedes cambiar estas credenciales por las de un admin real
  const adminCredentials = {
    email: 'admin@studymate.com',
    password: 'admin123'
  };

  let isAdminAvailable = false;

  test.beforeEach(async ({ page }) => {
    // Intentar login como admin
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => localStorage.clear());

    await page.getByLabel(/email/i).fill(adminCredentials.email);
    await page.getByLabel(/contraseña/i).fill(adminCredentials.password);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Esperar resultado del login
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    // Verificar si el login fue exitoso y es admin
    const currentUrl = page.url();
    isAdminAvailable = currentUrl.includes('/dashboard') || currentUrl.includes('/admin');
  });

  test('admin debe poder ver la página de usuarios', async ({ page }) => {
    test.skip(!isAdminAvailable, 'No hay usuario admin disponible');

    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Si redirige al dashboard, no es admin
    if (page.url().includes('/dashboard')) {
      test.skip(true, 'El usuario no tiene permisos de admin');
      return;
    }

    // Verificar elementos de la página
    await expect(page.getByRole('heading', { name: 'Administrar Usuarios' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Gestiona los usuarios del sistema')).toBeVisible();
  });

  test('admin debe ver la tabla de usuarios con columnas correctas', async ({ page }) => {
    test.skip(!isAdminAvailable, 'No hay usuario admin disponible');

    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/dashboard')) {
      test.skip(true, 'El usuario no tiene permisos de admin');
      return;
    }

    await expect(page.getByRole('heading', { name: 'Administrar Usuarios' })).toBeVisible({ timeout: 15000 });

    // Verificar estructura de la tabla
    await expect(page.getByRole('columnheader', { name: 'Nombre' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Rol' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Estado' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Acciones' })).toBeVisible();
  });

  test('admin debe poder buscar usuarios', async ({ page }) => {
    test.skip(!isAdminAvailable, 'No hay usuario admin disponible');

    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/dashboard')) {
      test.skip(true, 'El usuario no tiene permisos de admin');
      return;
    }

    await expect(page.getByRole('heading', { name: 'Administrar Usuarios' })).toBeVisible({ timeout: 15000 });

    // Verificar que el campo de búsqueda existe
    const searchInput = page.getByPlaceholder(/buscar por nombre o email/i);
    await expect(searchInput).toBeVisible();

    // Probar búsqueda
    await searchInput.fill('admin');
    await page.waitForTimeout(500);
    
    // El filtro debe aplicarse (al menos el admin debería aparecer)
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('admin debe ver el botón de nuevo usuario', async ({ page }) => {
    test.skip(!isAdminAvailable, 'No hay usuario admin disponible');

    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/dashboard')) {
      test.skip(true, 'El usuario no tiene permisos de admin');
      return;
    }

    await expect(page.getByRole('heading', { name: 'Administrar Usuarios' })).toBeVisible({ timeout: 15000 });

    // Verificar botón de nuevo usuario
    await expect(page.getByRole('button', { name: /nuevo usuario/i })).toBeVisible();
  });

  test('admin debe poder abrir el formulario de nuevo usuario', async ({ page }) => {
    test.skip(!isAdminAvailable, 'No hay usuario admin disponible');

    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/dashboard')) {
      test.skip(true, 'El usuario no tiene permisos de admin');
      return;
    }

    await expect(page.getByRole('heading', { name: 'Administrar Usuarios' })).toBeVisible({ timeout: 15000 });

    // Clic en nuevo usuario
    await page.getByRole('button', { name: /nuevo usuario/i }).click();

    // Verificar que el diálogo se abre
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /crear nuevo usuario/i })).toBeVisible();

    // Verificar campos del formulario
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('admin debe poder cerrar el formulario con botón cancelar', async ({ page }) => {
    test.skip(!isAdminAvailable, 'No hay usuario admin disponible');

    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/dashboard')) {
      test.skip(true, 'El usuario no tiene permisos de admin');
      return;
    }

    await expect(page.getByRole('heading', { name: 'Administrar Usuarios' })).toBeVisible({ timeout: 15000 });

    // Abrir formulario
    await page.getByRole('button', { name: /nuevo usuario/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Cerrar con botón cancelar
    await page.getByRole('button', { name: /cancelar/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('formulario de usuario debe tener selector de rol', async ({ page }) => {
    test.skip(!isAdminAvailable, 'No hay usuario admin disponible');

    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/dashboard')) {
      test.skip(true, 'El usuario no tiene permisos de admin');
      return;
    }

    await expect(page.getByRole('heading', { name: 'Administrar Usuarios' })).toBeVisible({ timeout: 15000 });

    // Abrir formulario
    await page.getByRole('button', { name: /nuevo usuario/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Verificar que existe el selector de rol
    await expect(page.getByText('Rol')).toBeVisible();
  });

  test('formulario de usuario debe tener checkbox de estado activo', async ({ page }) => {
    test.skip(!isAdminAvailable, 'No hay usuario admin disponible');

    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/dashboard')) {
      test.skip(true, 'El usuario no tiene permisos de admin');
      return;
    }

    await expect(page.getByRole('heading', { name: 'Administrar Usuarios' })).toBeVisible({ timeout: 15000 });

    // Abrir formulario
    await page.getByRole('button', { name: /nuevo usuario/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Verificar que existe el checkbox de activo
    await expect(page.locator('#active')).toBeVisible();
  });

  test('admin debe poder crear un nuevo usuario', async ({ page }) => {
    test.skip(!isAdminAvailable, 'No hay usuario admin disponible');

    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/dashboard')) {
      test.skip(true, 'El usuario no tiene permisos de admin');
      return;
    }

    await expect(page.getByRole('heading', { name: 'Administrar Usuarios' })).toBeVisible({ timeout: 15000 });

    // Abrir formulario
    await page.getByRole('button', { name: /nuevo usuario/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Llenar formulario
    const newUser = generateTestUser();
    await page.locator('#name').fill(newUser.name);
    await page.locator('#email').fill(newUser.email);
    await page.locator('#password').fill(newUser.password);

    // Guardar
    await page.getByRole('button', { name: /crear usuario/i }).click();

    // Verificar que el diálogo se cierra
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });
    
    // Verificar que aparece en la tabla (buscar por email)
    const searchInput = page.getByPlaceholder(/buscar por nombre o email/i);
    await searchInput.fill(newUser.email);
    await page.waitForTimeout(500);
    
    await expect(page.getByText(newUser.email)).toBeVisible({ timeout: 5000 });
  });
});

// ===== TESTS DE UI BÁSICOS =====
test.describe('Admin Users - Verificación de Rutas', () => {
  test('la ruta /admin/users debe existir y responder', async ({ page }) => {
    // Este test solo verifica que la ruta existe y responde
    const response = await page.goto('/admin/users');
    expect(response?.status()).toBeLessThan(500);
  });

  test('la ruta debe mostrar contenido o redirigir', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    
    // Debería estar en alguna página válida (login, dashboard o admin)
    const url = page.url();
    const isValidRedirect = url.includes('/login') || 
                           url.includes('/dashboard') || 
                           url.includes('/admin');
    expect(isValidRedirect).toBeTruthy();
  });
});
