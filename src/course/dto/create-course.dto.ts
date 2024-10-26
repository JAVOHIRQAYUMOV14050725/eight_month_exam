import { IsNotEmpty, IsString, IsOptional, IsDecimal, IsNumber, IsPositive, MaxLength } from 'class-validator';

export class CreateCourseDto {
    @IsNotEmpty({ message: 'Course name is required' })
    @IsString({ message: 'Course name must be a string' })
    @MaxLength(100, { message: 'Course name must not exceed 100 characters' })
    name: string;

    @IsNotEmpty({ message: 'Course description is required' })
    @IsString({ message: 'Course description must be a string' })
    description: string;

    @IsNotEmpty({ message: 'Course price is required' })
    @IsDecimal({ decimal_digits: '0,2' }, { message: 'Course price must be a decimal number' })
    @IsPositive({ message: 'Course price must be a positive number' })
    price: number;

    @IsOptional()
    @IsString({ message: 'Course category must be a string' })
    @MaxLength(100, { message: 'Course category must not exceed 100 characters' })
    category?: string;

    @IsOptional()
    @IsString({ message: 'Course level must be a string' })
    @MaxLength(50, { message: 'Course level must not exceed 50 characters' })
    level?: string;
}
