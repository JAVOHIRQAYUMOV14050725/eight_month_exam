import { Course } from 'src/course/entities/course.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';

@Entity()
@Unique(['student', 'course'])
export class Result {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    student: User;

    @ManyToOne(() => Course, { onDelete: 'CASCADE' })
    course: Course;

    @Column({ default: 0 })
    totalScore: number;

    @Column({ length: 50, nullable: true })
    grade: string;
}
