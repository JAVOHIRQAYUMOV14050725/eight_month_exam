import { Assignment } from 'src/assignment/entities/assignment.entity';
import { content_type } from 'src/enums/lesson.contentType.enum';
import { Modules } from 'src/module/entities/module.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Lesson {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    title: string;

    @Column({
        type: 'enum',
        enum: content_type,
    })
    contentType: content_type;

    @Column({ type: 'text' })
    content: string;

    @Column({ nullable: true })
    filePath: string | null;

    @Column({ type: 'int', nullable: false })
    moduleId: number;

    @ManyToOne(() => Modules, (module) => module.lessons, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'moduleId' }) 
    module: Modules;

    @ManyToOne(() => Assignment, (assignment) => assignment.lessons)
    assignment: Assignment;

    @CreateDateColumn()
    createdAt: Date;
}
