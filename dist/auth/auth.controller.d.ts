import { AuthService } from './auth.service';
import { CreateStudentDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import type { RequestUser } from './interfaces/request-user.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: CreateStudentDto): Promise<import("../users/entities/user.entity").Student>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
    getProfile(user: RequestUser): RequestUser;
}
