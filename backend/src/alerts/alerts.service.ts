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
    const alertDayEnd = dayjs().add(5, 'day').endOf('day').toDate();

    const tasks = await this.tasksService.findByAlertRange(
      alertDayStart,
      alertDayEnd,
    );
    if (!tasks.length) {
      this.logger.log('No hay tareas proximas a vencer');
      return;
    }

    for (const task of tasks) {
      const deliveryDate = dayjs(task.delivery_date);
      const today = dayjs().startOf('day');
      const daysUntilDue = deliveryDate.diff(today, 'day');

      // Crear alerta para cualquier tarea que venza en 5 días o menos
      if (daysUntilDue >= 0 && daysUntilDue <= 5) {
        // Verificar si ya existe una alerta para esta tarea y este día
        const existingAlert = await this.alertsRepository.findOne({
          where: {
            task: { task_id: task.task_id },
            alertDate: today.toDate(),
          },
        });

        if (!existingAlert) {
          await this.alertsRepository.insert({
            task: task,
            alertDate: today.toDate(),
            message: `La tarea "${task.title}" vence en ${daysUntilDue} ${daysUntilDue === 1 ? 'día' : 'días'}.`,
          });
          this.logger.log(`Alerta creada para tarea ${task.title} (${daysUntilDue} días restantes)`);
        }
      }
    }
  }

  findAlertsByUserId(userId: string) {
    return this.alertsRepository.find({
      where: { task: { subject: { student: { studentId: userId } } } },
      relations: ['task', 'task.subject'],
      order: { alertDate: 'DESC' },
    });
  }

  async generateAlertForTask(task: any) {
    const deliveryDate = dayjs(task.delivery_date).startOf('day');
    const today = dayjs().startOf('day');
    
    // Calcular días hasta la fecha de entrega
    const daysUntilDue = deliveryDate.diff(today, 'day');
    
    // Si la tarea vence en 5 días o menos, crear alerta inmediatamente
    if (daysUntilDue >= 0 && daysUntilDue <= 5) {
      // Verificar si ya existe una alerta para esta tarea y fecha
      const existingAlert = await this.alertsRepository.findOne({
        where: {
          task: { task_id: task.task_id },
          alertDate: today.toDate(),
        },
      });

      if (!existingAlert) {
        const alert = this.alertsRepository.create({
          task: task,
          alertDate: today.toDate(),
          message: `La tarea "${task.title}" vence en ${daysUntilDue} ${daysUntilDue === 1 ? 'día' : 'días'}.`,
        });
        
        await this.alertsRepository.save(alert);
        this.logger.log(`Alerta creada para tarea ${task.title} (${daysUntilDue} días restantes)`);
      }
    }
  }
}
