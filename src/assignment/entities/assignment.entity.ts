import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Submission } from 'src/submission/entities/submission.entity';
import { Modules } from 'src/module/entities/module.entity';
import { Lesson } from 'src/lesson/entities/lesson.entity';

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
