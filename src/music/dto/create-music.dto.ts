import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMusicDto {
  @IsNumber()
  @IsNotEmpty()
  mid: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  singer: string;

  @IsString()
  cover: string;
}
