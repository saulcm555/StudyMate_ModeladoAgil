import { Injectable } from '@nestjs/common';
import { Task, TaskPriority } from '../../tasks/entities/task.entity';
import { AlertType, AlertSeverity } from '../types/alert-types.enum';
import { CreateAlertData, IAlertFactory } from './alert-factory.interface';

@Injectable()
export class ReminderAlertFactory implements IAlertFactory {
  createAlertData(task: Task, daysUntilDue: number): CreateAlertData {
    const isHighPriority = task.priority === TaskPriority.HIGH;
    
    const emoji = isHighPriority ? '📌' : '📅';
    const prefix = isHighPriority ? 'Recordatorio importante' : 'Recordatorio';
    
    return {
      message: `${emoji} ${prefix}: La tarea "${task.title}" vence en ${daysUntilDue} días`,
      alertType: AlertType.REMINDER,
      severity: isHighPriority ? AlertSeverity.MEDIUM : AlertSeverity.LOW,
    };
  }
}
