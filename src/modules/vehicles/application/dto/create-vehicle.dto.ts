import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';

const currentYear = new Date().getFullYear() + 1;

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  licensePlate!: string;

  @IsString()
  @IsNotEmpty()
  chassis!: string;

  @IsString()
  @IsNotEmpty()
  renavam!: string;

  @IsInt()
  @Min(1900)
  @Max(currentYear)
  year!: number;

  @IsUUID()
  modelId!: string;
}
