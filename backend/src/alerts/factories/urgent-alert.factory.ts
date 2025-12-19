import { Injectable } from '@nestjs/common';
import { Task, TaskPriority } from '../../tasks/entities/task.entity';
import { AlertType, AlertSeverity } from '../types/alert-types.enum';
import { CreateAlertData, IAlertFactory } from './alert-factory.interface';

@Injectable()
export class UrgentAlertFactory implements IAlertFactory {
  createAlertData(task: Task): CreateAlertData {
    const isHighPriority = task.priority === TaskPriority.HIGH;
    
    const emoji = isHighPriority ? '🔴' : '🚨';
    const prefix = isHighPriority ? 'ALTA PRIORIDAD' : '¡URGENTE!';
    
    return {
      message: `${emoji} ${prefix}: La tarea "${task.title}" vence HOY`,
      alertType: AlertType.URGENT,
      severity: AlertSeverity.HIGH,
    };
  }
}
