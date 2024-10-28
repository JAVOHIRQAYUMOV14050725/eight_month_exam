import { Course } from 'src/course/entities/course.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { User_Role } from 'src/enums/user.role.enum';
import { Submission } from 'src/submission/entities/submission.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ unique: true, length: 100 })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    refreshToken?: string;

    @Column({
        type: "enum",
        enum: User_Role, 
    })
    role:User_Role ;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    iat: Date;

    @OneToMany(() => Course, (course) => course.teacher)
    courses: Course[];

    @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
    enrollments: Enrollment[];

    @OneToMany(() => Submission, (submission) => submission.student)
    submissions: Submission[];
}
