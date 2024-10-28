import { Assignment } from 'src/assignment/entities/assignment.entity';
import { Course } from 'src/course/entities/course.entity';
import { Lesson } from 'src/lesson/entities/lesson.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity()
export class Modules {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @OneToMany(() => Lesson, (lesson) => lesson.module, { onDelete: 'CASCADE' })
    lessons: Lesson[];

    @OneToMany(() => Assignment, (assignment) => assignment.module, { onDelete: 'CASCADE' })
    assignments: Assignment[]; 

    @Column()
    courseId: number;

    @ManyToOne(() => Course, course => course.modules)
    @JoinColumn({ name: 'courseId' })
    course: Course;

    @CreateDateColumn()
    createdAt: Date;
}