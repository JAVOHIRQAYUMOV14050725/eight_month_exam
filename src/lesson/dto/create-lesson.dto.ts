import { IsNotEmpty, IsString, IsEnum, IsInt, Length, IsOptional } from 'class-validator';
import { content_type } from '../../enums/lesson.contentType.enum';

export class CreateLessonDto {
  @IsNotEmpty({ message: 'title should not be empty' })
  @IsString({ message: 'title must be a string' })
  @Length(1, 100, { message: 'title must be longer than or equal to 1 characters' })
  title: string;

  @IsNotEmpty({ message: 'contentType should not be empty' })
  @IsEnum(content_type, { message: 'contentType must be one of the following values: video, text' })
  contentType: content_type;

  @IsNotEmpty({ message: 'content should not be empty' })
  @IsString({ message: 'content must be a string' })
  content: string;

  @IsOptional() 
  @IsString({ message: 'filePath must be a string' }) 
  filePath?: string | null;

  @IsNotEmpty({ message: 'moduleId should not be empty' })
  @IsInt({ message: 'moduleId must be an integer' })
  moduleId: number;
}
