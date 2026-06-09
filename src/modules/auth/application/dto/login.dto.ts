import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  login!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export interface LoginResult {
  accessToken: string;
  user: {
    id: string;
    nickname: string;
    name: string;
    email: string;
  };
}
