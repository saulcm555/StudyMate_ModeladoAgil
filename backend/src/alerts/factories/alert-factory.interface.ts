import { Task } from '../../tasks/entities/task.entity';
import { AlertType, AlertSeverity } from '../types/alert-types.enum';

export interface CreateAlertData {
  message: string;
  alertType: AlertType;
  severity: AlertSeverity;
}

export interface IAlertFactory {
  createAlertData(task: Task, daysUntilDue?: number): CreateAlertData;
}
