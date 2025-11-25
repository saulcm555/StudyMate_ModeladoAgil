import { Student } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';
export interface ScheduleItem {
    day: string;
    start: string;
    end: string;
}
export declare class Subject {
    subjectId: string;
    student: Student;
    tasks: Task[];
    name: string;
    assignedTeacher: string;
    schedule: ScheduleItem[];
    color: string;
}
