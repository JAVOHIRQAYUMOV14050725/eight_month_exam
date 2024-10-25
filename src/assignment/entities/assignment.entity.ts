import { Modules } from 'src/module/entities/module.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

@Entity()
export class Assignment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    description: string;

    @Column()
    maxScore: number;

    @ManyToOne(() => Modules, (module) => module.assignments, { onDelete: 'CASCADE' })
    module: Modules;

    @CreateDateColumn()
    createdAt: Date;
}
