import { api } from '@/lib/api';

// Interfaces
export interface User {
  studentId: string;
  name: string;
  email: string;
  role: 'Student' | 'Admin';
  active: boolean;
  createdAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  active?: boolean;
  role?: 'Student' | 'Admin';
}

// Servicio API
export const adminService = {
  // Obtener todos los usuarios
  getAllUsers: async (): Promise<User[]> => {
    const { data } = await api.get('/users');
    return data;
  },

  // Obtener un usuario por ID
  getUserById: async (id: string): Promise<User> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  // Crear un nuevo usuario
  createUser: async (userData: CreateUserDto): Promise<User> => {
    const { data } = await api.post('/users', userData);
    return data;
  },

  // Actualizar un usuario
  updateUser: async (id: string, userData: UpdateUserDto): Promise<User> => {
    const { data } = await api.patch(`/users/${id}`, userData);
    return data;
  },

  // Eliminar un usuario
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
