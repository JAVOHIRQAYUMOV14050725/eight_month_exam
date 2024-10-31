import { IsNotEmpty, IsString, IsInt, MaxLength } from 'class-validator';

export class CreateModuleDto {
    @IsNotEmpty({ message: 'Module name is a required field.' })
    @IsString({ message: 'Module name must be a string.' })
    @MaxLength(100, { message: 'Module name cannot exceed 100 characters.' })
    name: string;

    @IsNotEmpty({ message: 'Course ID is a required field.' })
    @IsInt({ message: 'Course ID must be an integer.' })
    courseId: number;
}
