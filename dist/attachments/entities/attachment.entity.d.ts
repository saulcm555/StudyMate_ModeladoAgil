import { Task } from '../../tasks/entities/task.entity';
export declare class Attachment {
    attachmentId: string;
    fileName: string;
    originalName: string;
    fileUrl: string;
    mimeType: string;
    fileSize: number;
    uploadedAt: Date;
    task: Task;
}
