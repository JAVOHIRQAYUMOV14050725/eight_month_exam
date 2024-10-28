import { Assignment } from 'src/assignment/entities/assignment.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

@Entity()
export class Submission {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Assignment, (assignment) => assignment.submissions, { onDelete: 'CASCADE' })
    assignment: Assignment; 

    @ManyToOne(() => User, (user) => user.submissions, { onDelete: 'CASCADE' })
    student: User;

    @Column({ nullable: true })
    score: number;

    @Column({ type: 'text', nullable: true })
    feedback: string;

    @CreateDateColumn()
  submissionDate: Date;

  @Column({type:'text'})
  content: string;
}
