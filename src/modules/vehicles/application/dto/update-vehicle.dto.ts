import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

const currentYear = new Date().getFullYear() + 1;

export class UpdateVehicleDto {
  @IsString()
  @IsOptional()
  licensePlate?: string;

  @IsString()
  @IsOptional()
  chassis?: string;

  @IsString()
  @IsOptional()
  renavam?: string;

  @IsInt()
  @Min(1900)
  @Max(currentYear)
  @IsOptional()
  year?: number;

  @IsUUID()
  @IsOptional()
  modelId?: string;
}
