import { Subject } from '../../subjects/entities/subject.entity';
export declare class Student {
    studentId: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    subjects: Subject[];
}
