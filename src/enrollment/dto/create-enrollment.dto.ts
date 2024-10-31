import { IsNotEmpty, IsNumber } from 'class-validator';
import { FindOperator } from 'typeorm';

export class CreateEnrollmentDto {
  @IsNotEmpty({ message: 'courseId should not be empty' })
  @IsNumber()
  courseId: number;

}
