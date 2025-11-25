import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { TasksService } from '../tasks/tasks.service';
import dayjs from 'dayjs';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Alert)
    private readonly alertsRepository: Repository<Alert>,

    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async create() {
    this.logger.log('Revisando tareas ...');
    await this.generateAlerts();
  }

  async generateAlerts() {
    const alertDayStart = dayjs().startOf('day').toDate();
    const alertDayEnd = dayjs().add(2, 'day').endOf('day').toDate();

    const tasks = await this.tasksService.findByAlertRange(
      alertDayStart,
      alertDayEnd,
    );
    if (!tasks.length) {
      this.logger.log('No hay tareas proximas a vencer');
      return;
    }

    for (const task of tasks) {
      await this.alertsRepository.insert({
        task: task,
        alertDate: alertDayStart,
        message: `The task "${task.title}" is due in less than 2 days.`,
      });
      this.logger.log(`Notification created for task ${task.title}`);
    }
  }

  findAlertsByUserId(userId: string) {
    return this.alertsRepository.find({
      where: { task: { subject: { student: { studentId: userId } } } },
    });
  }
}
