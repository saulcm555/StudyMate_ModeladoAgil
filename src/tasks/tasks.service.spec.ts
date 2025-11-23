import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task, TaskState, TaskPriority } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<Task>;

  const mockSubject = {
    subjectId: 'subject-1',
    name: 'Mathematics',
    assignedTeacher: 'Dr. Smith',
  };

  const mockTask = {
    task_id: '1',
    title: 'Test Task',
    description: 'Test Description',
    start_date: new Date('2024-12-01'),
    delivery_date: new Date('2024-12-15'),
    priority: TaskPriority.HIGH,
    state: TaskState.PENDING,
    subject: mockSubject,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear una nueva tarea exitosamente', async () => {
      const createTaskDto: CreateTaskDto = {
        subjectId: 'subject-1',
        title: 'Test Task',
        description: 'Test Description',
        start_date: new Date('2024-12-01'),
        delivery_date: new Date('2024-12-15'),
        priority: TaskPriority.HIGH,
        state: TaskState.PENDING,
      };

      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockResolvedValue(mockTask);

      const result = await service.create(createTaskDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createTaskDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockTask);
      expect(result).toEqual(mockTask);
    });

    it('debería manejar errores del repositorio', async () => {
      const createTaskDto: CreateTaskDto = {
        subjectId: 'subject-1',
        title: 'Test Task',
        description: 'Test Description',
        start_date: new Date('2024-12-01'),
        delivery_date: new Date('2024-12-15'),
        priority: TaskPriority.MEDIUM,
        state: TaskState.PENDING,
      };

      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createTaskDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('debería retornar todas las tareas', async () => {
      const tasks = [mockTask];
      mockRepository.find.mockResolvedValue(tasks);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['subject'],
      });
      expect(result).toEqual(tasks);
    });

    it('debería retornar array vacío si no hay tareas', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('debería retornar una tarea por ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne('1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { task_id: '1' },
        relations: ['subject'],
      });
      expect(result).toEqual(mockTask);
    });

    it('debería lanzar NotFoundException si no encuentra la tarea', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySubject', () => {
    it('debería retornar tareas por ID de materia', async () => {
      const tasks = [mockTask];
      mockRepository.find.mockResolvedValue(tasks);

      const result = await service.findBySubject('subject-1');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { subject: { subjectId: 'subject-1' } },
        relations: ['subject'],
      });
      expect(result).toEqual(tasks);
    });

    it('debería retornar array vacío si no hay tareas para la materia', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findBySubject('nonexistent-subject');

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('debería actualizar una tarea exitosamente', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
      };

      const updatedTask = { ...mockTask, ...updateTaskDto };

      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.save.mockResolvedValue(updatedTask);

      const result = await service.update('1', updateTaskDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { task_id: '1' },
        relations: ['subject'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedTask);
      expect(result).toEqual(updatedTask);
    });

    it('debería lanzar NotFoundException si no encuentra la tarea', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('999', { title: 'Updated' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debería eliminar una tarea exitosamente', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.remove.mockResolvedValue(mockTask);

      await service.remove('1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { task_id: '1' },
        relations: ['subject'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockTask);
    });

    it('debería lanzar NotFoundException si no encuentra la tarea', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});