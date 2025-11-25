import { Subject } from '../../subjects/entities/subject.entity';
import { Alert } from '../../alerts/entities/alert.entity';
import { Attachment } from '../../attachments/entities/attachment.entity';
export declare enum TaskState {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare enum TaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare class Task {
    task_id: string;
    subject: Subject;
    title: string;
    description: string;
    start_date: Date;
    delivery_date: Date;
    priority: TaskPriority;
    state: TaskState;
    alerts: Alert[];
    attachments: Attachment[];
}
