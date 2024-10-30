import { Assignment } from '../../assignment/entities/assignment.entity';
import { Course } from '../../course/entities/course.entity';
import { Lesson } from '../../lesson/entities/lesson.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity()
export class Modules {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @OneToMany(() => Lesson, (lesson) => lesson.module)
    lessons: Lesson[];

    @OneToMany(() => Assignment, (assignment) => assignment.module)
    assignments: Assignment[];

    @Column()
    courseId: number;

    @ManyToOne(() => Course, course => course.modules, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'courseId' }) 
    course: Course;

    @CreateDateColumn()
    createdAt: Date;
}
