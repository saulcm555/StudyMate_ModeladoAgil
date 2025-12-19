import { Injectable } from '@nestjs/common';
import { Task } from '../../tasks/entities/task.entity';
import { IAlertFactory, CreateAlertData } from './alert-factory.interface';
import { UrgentAlertFactory } from './urgent-alert.factory';
import { WarningAlertFactory } from './warning-alert.factory';
import { ReminderAlertFactory } from './reminder-alert.factory';

@Injectable()
export class AlertFactory {
  constructor(
    private readonly urgentFactory: UrgentAlertFactory,
    private readonly warningFactory: WarningAlertFactory,
    private readonly reminderFactory: ReminderAlertFactory,
  ) {}

  /**
   * Decide qué factory usar según los días restantes hasta el vencimiento
   */
  private getFactory(daysUntilDue: number): IAlertFactory {
    if (daysUntilDue === 0) {
      return this.urgentFactory;
    } else if (daysUntilDue <= 2) {
      return this.warningFactory;
    } else if (daysUntilDue <= 5) {
      return this.reminderFactory;
    }
    
    // Default: reminder para cualquier caso no cubierto
    return this.reminderFactory;
  }

  createAlert(task: Task, daysUntilDue: number): CreateAlertData {
    const factory = this.getFactory(daysUntilDue);
    return factory.createAlertData(task, daysUntilDue);
  }
}
