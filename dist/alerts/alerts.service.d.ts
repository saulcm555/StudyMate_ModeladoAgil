import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { TasksService } from 'src/tasks/tasks.service';
export declare class AlertsService {
    private readonly alertsRepository;
    private readonly tasksService;
    private readonly logger;
    constructor(alertsRepository: Repository<Alert>, tasksService: TasksService);
    create(): Promise<void>;
}
