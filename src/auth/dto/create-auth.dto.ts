import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAuthDto {
  
  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @IsEmail()
  email: string;


  @ApiProperty()
  @IsString()
  @MinLength(6)
  readonly password: string;
}
