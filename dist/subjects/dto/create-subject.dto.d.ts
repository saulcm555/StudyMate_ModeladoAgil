import type { ScheduleItem } from '../entities/subject.entity';
export declare class ScheduleItemDto implements ScheduleItem {
    day: string;
    start: string;
    end: string;
}
export declare class CreateSubjectDto {
    name: string;
    assignedTeacher: string;
    schedule: ScheduleItemDto[];
    color: string;
    studentId: string;
}
