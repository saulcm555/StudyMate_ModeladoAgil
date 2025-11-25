import { UsersService } from './users.service';
import { CreateStudentDto } from './dto/create-user.dto';
import { UpdateStudentsDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createStudentDto: CreateStudentDto): Promise<import("./entities/user.entity").Student>;
    findAll(): Promise<import("./entities/user.entity").Student[]>;
    findOne(id: string): Promise<import("./entities/user.entity").Student>;
    update(id: string, updateStudentsDto: UpdateStudentsDto): Promise<import("./entities/user.entity").Student | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
