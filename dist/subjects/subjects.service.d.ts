import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { UsersService } from 'src/users/users.service';
export declare class SubjectsService {
    private readonly subjectsRepository;
    private readonly studentsService;
    constructor(subjectsRepository: Repository<Subject>, studentsService: UsersService);
    create(createSubjectDto: CreateSubjectDto): Promise<Subject>;
    findAll(): Promise<Subject[]>;
    findOne(id: string): Promise<Subject>;
    update(id: string, updateSubjectDto: UpdateSubjectDto): Promise<Subject>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
