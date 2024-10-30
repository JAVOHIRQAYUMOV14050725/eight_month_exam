import { IsNotEmpty, IsString, IsOptional, IsDecimal, IsPositive, MaxLength, IsEnum, IsNumber } from 'class-validator';
import { CourseLevel } from '../../enums/course.level.enum';

export class CreateCourseDto {
    @IsNotEmpty({ message: 'Course name is required' })
    @IsString({ message: 'Course name must be a string' })
    @MaxLength(100, { message: 'Course name must not exceed 100 characters' })
    name: string;

    @IsNotEmpty({ message: 'Course description is required' })
    @IsString({ message: 'Course description must be a string' })
    description: string;

    @IsNotEmpty({ message: 'Course price is required' })
    @IsNumber()
    @IsPositive({ message: 'Course price must be a positive number' })
    price: number;

    @IsNotEmpty({ message: 'Course category is required' })
    @IsString({ message: 'Course category must be a string' })
    @MaxLength(100, { message: 'Course category must not exceed 100 characters' })
    category: string;

    @IsOptional()
    @IsEnum(CourseLevel, { message: 'Course level must be one of: oson, o\'rta, qiyin' })
    level?: CourseLevel = CourseLevel.EASY;
}
