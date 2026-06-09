import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateModelDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID()
  @IsOptional()
  brandId?: string;
}
