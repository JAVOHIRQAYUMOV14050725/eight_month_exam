import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Modules } from 'src/module/entities/module.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';


@Entity()
export class Course {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'decimal' })
    price: number;

    @ManyToOne(() => User, (user) => user.courses, { nullable: true })
    teacher: User;

    @Column({ length: 100, nullable: true })
    category: string;

    @Column({ length: 50, nullable: true })
    level: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Modules, (module) => module.course)
    modules: Modules[];

    @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
    enrollments: Enrollment[];
}
