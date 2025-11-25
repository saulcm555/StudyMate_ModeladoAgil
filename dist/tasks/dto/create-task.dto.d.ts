import { TaskState, TaskPriority } from '../entities/task.entity';
export declare class CreateTaskDto {
    subjectId: string;
    title: string;
    description: string;
    start_date: Date;
    delivery_date: Date;
    priority: TaskPriority;
    state: TaskState;
}
