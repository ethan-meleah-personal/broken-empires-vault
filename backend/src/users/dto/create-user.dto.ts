import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(3)
    @MaxLength(32)
    username: string;

    // bcrypt only uses the first 72 bytes, so cap the length
    @IsString()
    @MinLength(8)
    @MaxLength(72)
    password: string;
}
