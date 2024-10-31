import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSubmissionDto {
    @IsNotEmpty()
    @IsNumber()
    assignmentId: number;

    @IsNotEmpty()
    @IsString()
    content: string
}