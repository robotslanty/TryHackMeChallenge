import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EditUserDto {
    @IsNotEmpty()
    @IsEmail()
    email?: string;

    @IsNotEmpty()
    @IsString()
    name?: string;
}
