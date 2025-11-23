import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Student } from './entities/user.entity';
import { CreateStudentDto } from './dto/create-user.dto';
import { UpdateStudentsDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<Student>;

  const mockStudent = {
    studentId: 'student-1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Student),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<Student>>(getRepositoryToken(Student));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un nuevo estudiante exitosamente', async () => {
      const createStudentDto: CreateStudentDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockRepository.findOneBy.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockStudent);
      mockRepository.save.mockResolvedValue(mockStudent);

      const result = await service.create(createStudentDto);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ 
        email: 'john@example.com' 
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createStudentDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockStudent);
      expect(result).toEqual(mockStudent);
    });

    it('debería lanzar ConflictException si el email ya existe', async () => {
      const createStudentDto: CreateStudentDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockRepository.findOneBy.mockResolvedValue(mockStudent);

      await expect(service.create(createStudentDto)).rejects.toThrow(ConflictException);
    });

    it('debería manejar errores del repositorio', async () => {
      const createStudentDto: CreateStudentDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      };

      mockRepository.findOneBy.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockStudent);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createStudentDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los estudiantes', async () => {
      const students = [mockStudent];
      mockRepository.find.mockResolvedValue(students);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(students);
    });

    it('debería retornar array vacío si no hay estudiantes', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('debería retornar un estudiante por ID', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockStudent);

      const result = await service.findOne('student-1');

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        studentId: 'student-1',
      });
      expect(result).toEqual(mockStudent);
    });

    it('debería lanzar NotFoundException si no encuentra el estudiante', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debería actualizar un estudiante exitosamente', async () => {
      const updateStudentDto: UpdateStudentsDto = {
        name: 'Jane Doe',
      };

      const updatedStudent = { ...mockStudent, ...updateStudentDto };

      mockRepository.findOneBy.mockResolvedValue(mockStudent);
      mockRepository.save.mockResolvedValue(updatedStudent);

      const result = await service.update('student-1', updateStudentDto);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        studentId: 'student-1',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedStudent);
      expect(result).toEqual(updatedStudent);
    });

    it('debería lanzar NotFoundException si no encuentra el estudiante', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update('999', { name: 'Jane Doe' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debería eliminar un estudiante exitosamente', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockStudent);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove('student-1');

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        studentId: 'student-1',
      });
      expect(mockRepository.delete).toHaveBeenCalledWith('student-1');
      expect(result).toEqual({ affected: 1 });
    });

    it('debería lanzar NotFoundException si no encuentra el estudiante', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});