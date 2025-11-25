import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
export declare class SubjectsController {
    private readonly subjectsService;
    constructor(subjectsService: SubjectsService);
    create(createSubjectDto: CreateSubjectDto): Promise<import("./entities/subject.entity").Subject>;
    findAll(): Promise<import("./entities/subject.entity").Subject[]>;
    findOne(id: string): Promise<import("./entities/subject.entity").Subject>;
    update(id: string, updateSubjectDto: UpdateSubjectDto): Promise<import("./entities/subject.entity").Subject>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
