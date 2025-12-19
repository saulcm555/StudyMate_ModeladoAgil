import { Module, forwardRef } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { TasksModule } from 'src/tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './entities/alert.entity';
import { AlertFactory } from './factories/alert-factory';
import { UrgentAlertFactory } from './factories/urgent-alert.factory';
import { WarningAlertFactory } from './factories/warning-alert.factory';
import { ReminderAlertFactory } from './factories/reminder-alert.factory';

@Module({
  imports: [TypeOrmModule.forFeature([Alert]), forwardRef(() => TasksModule)],
  controllers: [AlertsController],
  providers: [
    AlertsService,
    AlertFactory,
    UrgentAlertFactory,
    WarningAlertFactory,
    ReminderAlertFactory,
  ],
  exports: [AlertsService],
})
export class AlertsModule {}
