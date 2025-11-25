import { CreateStudentDto } from './dto/create-user.dto';
import { Student } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateStudentsDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly studentRepository;
    constructor(studentRepository: Repository<Student>);
    create(createStudentDto: CreateStudentDto): Promise<Student>;
    findAll(): Promise<Student[]>;
    findOne(id: string): Promise<Student>;
    findByEmail(email: string): Promise<Student | null>;
    update(id: string, updateStudentDto: UpdateStudentsDto): Promise<Student | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
