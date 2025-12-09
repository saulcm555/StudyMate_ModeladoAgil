import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { AlertType, AlertSeverity } from '../types/alert-types.enum';

@Entity()
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  alertId: string;

  @Column({ type: 'timestamp' })
  alertDate: Date;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: AlertType,
    default: AlertType.REMINDER,
  })
  alertType: AlertType;

  @Column({
    type: 'enum',
    enum: AlertSeverity,
    default: AlertSeverity.LOW,
  })
  severity: AlertSeverity;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => Task, (task) => task.alerts, {
    onDelete: 'CASCADE',
  })
  task: Task;
}

