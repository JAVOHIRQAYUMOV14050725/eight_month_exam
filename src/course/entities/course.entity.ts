import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { Modules } from '../../module/entities/module.entity';
import { User } from '../../user/entities/user.entity';
import { CourseLevel } from '../../enums/course.level.enum';

@Entity()
export class Course {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique:true, length: 100 })
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'int' })
    price: number;

    @ManyToOne(() => User, (user) => user.courses, { nullable: true })
    teacher: User;

    @Column({ length: 100, nullable: true })
    category: string;

    @Column({
        type: 'enum',
        enum: CourseLevel,
        default: CourseLevel.EASY,
    })
    level: CourseLevel;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Modules, (module) => module.course)
    modules: Modules[];

    @OneToMany(() => Enrollment, (enrollment) => enrollment.course, { onDelete: 'CASCADE' })
    enrollments: Enrollment[];
}
