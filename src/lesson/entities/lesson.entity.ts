import { content_type } from 'src/enums/lesson.contentType.enum';
import { Modules } from 'src/module/entities/module.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

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

    @ManyToOne(() => Modules, (module) => module.lessons, { onDelete: 'CASCADE' })
    module: Modules;

    @CreateDateColumn()
    createdAt: Date;
}
