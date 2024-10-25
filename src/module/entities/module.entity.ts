import { Course } from 'src/course/entities/course.entity';
import { Lesson } from 'src/lesson/entities/lesson.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Modules {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @ManyToOne(() => Course, (course) => course.modules, { onDelete: 'CASCADE' })
    course: Course;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Lesson, (lesson) => lesson.module)
    lessons: Lesson[];
    assignments: any;
}
