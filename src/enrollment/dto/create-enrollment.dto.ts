import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateEnrollmentDto {
    @IsNotEmpty({ message: 'courseId should not be empty' })
    @IsInt({ message: 'courseId must be an integer number' })
    courseId: number;
}
