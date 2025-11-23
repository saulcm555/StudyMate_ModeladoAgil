import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { UsersService } from '../users/users.service';

describe('SubjectsService', () => {
  let service: SubjectsService;
  let repository: Repository<Subject>;
  let usersService: UsersService;

  const mockStudent = {
    studentId: 'student-1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  const mockSubject = {
    subjectId: 'subject-1',
    name: 'Mathematics',
    assignedTeacher: 'Dr. Smith',
    schedule: [
      { day: 'Monday', start: '08:00', end: '10:00' }
    ],
    color: '#FF5733',
    student: mockStudent,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        {
          provide: getRepositoryToken(Subject),
          useValue: mockRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
    repository = module.get<Repository<Subject>>(getRepositoryToken(Subject));
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear una nueva materia exitosamente', async () => {
      const createSubjectDto: CreateSubjectDto = {
        studentId: 'student-1',
        name: 'Mathematics',
        assignedTeacher: 'Dr. Smith',
        schedule: [],
        color: '#FF5733',
      };

      mockUsersService.findOne.mockResolvedValue(mockStudent);
      mockRepository.create.mockReturnValue(mockSubject);
      mockRepository.save.mockResolvedValue(mockSubject);

      const result = await service.create(createSubjectDto);

      expect(mockUsersService.findOne).toHaveBeenCalledWith('student-1');
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createSubjectDto,
        student: mockStudent,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockSubject);
      expect(result).toEqual(mockSubject);
    });

    it('debería lanzar NotFoundException cuando el estudiante no existe', async () => {
      const createSubjectDto: CreateSubjectDto = {
        studentId: 'nonexistent-student',
        name: 'Mathematics',
        assignedTeacher: 'Dr. Smith',
        schedule: [],
        color: '#FF5733',
      };

      mockUsersService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.create(createSubjectDto)).rejects.toThrow(NotFoundException);
    });

    it('debería manejar errores del repositorio', async () => {
      const createSubjectDto: CreateSubjectDto = {
        studentId: 'student-1',
        name: 'Mathematics',
        assignedTeacher: 'Dr. Smith',
        schedule: [],
        color: '#FF5733',
      };

      mockUsersService.findOne.mockResolvedValue(mockStudent);
      mockRepository.create.mockReturnValue(mockSubject);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createSubjectDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('debería retornar todas las materias', async () => {
      const subjects = [mockSubject];
      mockRepository.find.mockResolvedValue(subjects);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(subjects);
    });

    it('debería retornar array vacío si no hay materias', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('debería retornar una materia por ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockSubject);

      const result = await service.findOne('subject-1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { subjectId: 'subject-1' },
      });
      expect(result).toEqual(mockSubject);
    });

    it('debería lanzar NotFoundException si no encuentra la materia', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debería actualizar una materia exitosamente', async () => {
      const updateSubjectDto: UpdateSubjectDto = {
        name: 'Updated Mathematics',
      };

      const updatedSubject = { ...mockSubject, ...updateSubjectDto };

      mockRepository.findOne.mockResolvedValue(mockSubject);
      mockRepository.save.mockResolvedValue(updatedSubject);

      const result = await service.update('subject-1', updateSubjectDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { subjectId: 'subject-1' },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedSubject);
      expect(result).toEqual(updatedSubject);
    });

    it('debería lanzar NotFoundException si no encuentra la materia', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('999', { name: 'Updated' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debería eliminar una materia exitosamente', async () => {
      mockRepository.findOne.mockResolvedValue(mockSubject);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove('subject-1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { subjectId: 'subject-1' },
      });
      expect(mockRepository.delete).toHaveBeenCalledWith('subject-1');
      expect(result).toEqual({ affected: 1 });
    });

    it('debería lanzar NotFoundException si no encuentra la materia', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});