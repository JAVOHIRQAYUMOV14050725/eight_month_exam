import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAssignmentDto {
    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    maxScore: number;
}
