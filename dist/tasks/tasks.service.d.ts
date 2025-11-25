import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { Subject } from '../subjects/entities/subject.entity';
export declare class TasksService {
    private readonly taskRepository;
    private readonly subjectRepository;
    constructor(taskRepository: Repository<Task>, subjectRepository: Repository<Subject>);
    create(createTaskDto: CreateTaskDto): Promise<Task>;
    findAll(): Promise<Task[]>;
    findByAlertRange(start: Date, end: Date): Promise<Task[]>;
    findOne(id: string): Promise<Task>;
    findBySubject(subjectId: string): Promise<Task[]>;
    update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task>;
    remove(id: string): Promise<void>;
}
