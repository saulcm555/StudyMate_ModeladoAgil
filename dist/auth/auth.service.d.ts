import { CreateStudentDto } from 'src/users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    constructor(userService: UsersService, jwtService: JwtService);
    register(registerDto: CreateStudentDto): Promise<import("../users/entities/user.entity").Student>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
}
