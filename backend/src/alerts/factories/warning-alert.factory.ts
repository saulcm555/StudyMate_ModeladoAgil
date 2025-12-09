import { Injectable } from '@nestjs/common';
import { Task, TaskPriority } from '../../tasks/entities/task.entity';
import { AlertType, AlertSeverity } from '../types/alert-types.enum';
import { CreateAlertData, IAlertFactory } from './alert-factory.interface';

@Injectable()
export class WarningAlertFactory implements IAlertFactory {
  createAlertData(task: Task, daysUntilDue: number): CreateAlertData {
    const isHighPriority = task.priority === TaskPriority.HIGH;
    
    const emoji = isHighPriority ? '🔴' : '⚠️';
    const prefix = isHighPriority ? 'ALTA PRIORIDAD' : 'Advertencia';
    const timeText = daysUntilDue === 1 ? 'MAÑANA' : `en ${daysUntilDue} días`;
    
    return {
      message: `${emoji} ${prefix}: La tarea "${task.title}" vence ${timeText}`,
      alertType: AlertType.WARNING,
      severity: isHighPriority ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
    };
  }
}
