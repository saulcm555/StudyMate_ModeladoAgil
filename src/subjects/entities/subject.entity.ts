import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Student } from '../../users/entities/user.entity';

export interface ScheduleItem {
  day: string;
  start: string;
  end: string;
}

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  subjectId: string;

  @ManyToOne(() => Student, (student) => student.subjects, {
    onDelete: 'CASCADE',
  })
  student: Student;

  @Column()
  name: string;

  @Column()
  assignedTeacher: string;

  @Column({ type: 'json', nullable: true })
  schedule: ScheduleItem[];

  @Column()
  color: string;
}
