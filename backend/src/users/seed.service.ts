import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user.role';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const adminEmail = 'admin@studymate.com';
    
    try {
      // Verificar si el admin ya existe
      const existingAdmin = await this.studentRepository.findOne({
        where: { email: adminEmail },
      });

      if (existingAdmin) {
        this.logger.log('Admin user already exists, skipping seed');
        return;
      }

      // Crear usuario admin
      const adminPassword = await bcrypt.hash('Admin123!', 10);
      const admin = this.studentRepository.create({
        name: 'Administrator',
        email: adminEmail,
        password: adminPassword,
        role: UserRole.ADMIN,
        active: true,
      });

      await this.studentRepository.save(admin);
      this.logger.log('✅ Admin user created successfully');
      this.logger.log(`Email: ${adminEmail}`);
      this.logger.log('Password: Admin123!');
      this.logger.log('⚠️  Please change the password after first login');
    } catch (error) {
      this.logger.error('Error creating admin user:', error);
    }
  }
}
