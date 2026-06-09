import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../../../shared/auth/jwt-types';
import { CreateVehicleDto } from '../../application/dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../../application/dto/update-vehicle.dto';
import { CreateVehicleUseCase } from '../../application/use-cases/create-vehicle.use-case';
import { UpdateVehicleUseCase } from '../../application/use-cases/update-vehicle.use-case';
import { DeleteVehicleUseCase } from '../../application/use-cases/delete-vehicle.use-case';
import { FindVehicleUseCase } from '../../application/use-cases/find-vehicle.use-case';
import { ListVehiclesUseCase } from '../../application/use-cases/list-vehicles.use-case';

@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class VehicleController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase,
    private readonly findVehicleUseCase: FindVehicleUseCase,
    private readonly listVehiclesUseCase: ListVehiclesUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateVehicleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return {
      data: await this.createVehicleUseCase.execute({
        ...dto,
        userId: req.user.sub,
      }),
    };
  }

  @Get()
  async list() {
    return { data: await this.listVehiclesUseCase.execute() };
  }

  @Get(':id')
  async find(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.findVehicleUseCase.execute(id) };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return {
      data: await this.updateVehicleUseCase.execute({
        id,
        ...dto,
        userId: req.user.sub,
      }),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.deleteVehicleUseCase.execute({ id, userId: req.user.sub });
  }
}
