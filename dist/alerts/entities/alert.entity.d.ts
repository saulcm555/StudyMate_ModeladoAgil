import { Task } from '../../tasks/entities/task.entity';
export declare class Alert {
    alertId: string;
    alertDate: Date;
    message: string;
    created_at: Date;
    task: Task;
}
