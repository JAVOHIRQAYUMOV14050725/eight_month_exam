import { Course } from 'src/course/entities/course.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';

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
}
