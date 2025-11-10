import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // 🆕
import { UsersModule } from './users/users.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TasksModule } from './tasks/tasks.module';
import { AlertsModule } from './alerts/alerts.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { SupabaseModule } from './supabase/supabase.module'; // 🆕
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // 🆕 Configurar variables de entorno
    ConfigModule.forRoot({
      isGlobal: true, // Hace que ConfigService esté disponible globalmente
      envFilePath: '.env',
    }),
    
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5434,
      username: 'postgres',
      password: 'postgres',
      database: 'test',
      autoLoadEntities: true,
      synchronize: true,
    }),
    
    UsersModule,
    SubjectsModule,
    TasksModule,
    AlertsModule,
    AttachmentsModule,
    SupabaseModule,
    AuthModule, // 🆕 Agregar módulo de Supabase
  ],
})
export class AppModule {}