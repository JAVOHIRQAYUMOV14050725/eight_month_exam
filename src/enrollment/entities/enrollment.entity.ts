import { Course } from '../../course/entities/course.entity';
import { User } from '../../user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Column } from 'typeorm';

@Entity()
export class Enrollment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.enrollments, { onDelete: 'CASCADE' })
    student: User;

    @ManyToOne(() => Course, (course) => course.enrollments, { onDelete: 'CASCADE' })
    course: Course;

    @CreateDateColumn()
    enrolledAt: Date;

    @Column()
    userId: number;

    @Column()
    courseId: number;
}
