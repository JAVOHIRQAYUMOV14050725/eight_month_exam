import { Course } from 'src/course/entities/course.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';

@Entity()
export class Enrollment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.enrollments)
    student: User;

    @ManyToOne(() => Course, (course) => course.enrollments)
    course: Course;

    @CreateDateColumn()
    enrolledAt: Date;
}
