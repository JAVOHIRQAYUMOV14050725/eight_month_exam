import { IsNumber, IsString, IsOptional } from "class-validator";

export class UpdateSubmissionDto {
    @IsNumber()
    score: number;

    @IsString()
    feedback: string;

    @IsOptional()
    @IsNumber()
    assignmentId?: number;

    @IsOptional()
    @IsString()
    content?: string;
}
