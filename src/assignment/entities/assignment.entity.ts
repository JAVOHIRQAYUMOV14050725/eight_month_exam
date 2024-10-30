import { Lesson } from '../../lesson/entities/lesson.entity';
import { Modules } from '../../module/entities/module.entity';
import { Submission } from '../../submission/entities/submission.entity';

  import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
  @Entity()
  export class Assignment {
      @PrimaryGeneratedColumn()
      id: number;

      @Column({ type: 'text' })
      description: string;

      @Column()
      maxScore: number;

      @ManyToOne(() => Modules, (module) => module.assignments,{onDelete:'CASCADE'})
      module: Modules;

      @CreateDateColumn()
      createdAt: Date;

      @OneToMany(() => Submission, (submission) => submission.assignment)
      submissions: Submission[];
  

      @OneToMany(() => Lesson, (lesson) => lesson.assignment)
      lessons: Lesson[];
    title: any;
    dueDate: any;
    
  }
