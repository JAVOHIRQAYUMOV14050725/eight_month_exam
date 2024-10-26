import { IsEnum, IsOptional, IsString, Length, IsNotEmpty } from 'class-validator';
import { content_type } from 'src/enums/lesson.contentType.enum';

export class CreateLessonDto {
    @IsString()
    @Length(1, 100)
    @IsNotEmpty()
    title: string;

    @IsEnum(content_type)
    @IsNotEmpty()
    contentType: content_type;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsOptional()
    @IsString()
    filePath?: string | null; 
}
