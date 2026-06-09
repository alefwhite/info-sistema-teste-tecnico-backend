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
import { CreateModelDto } from '../../application/dto/create-model.dto';
import { UpdateModelDto } from '../../application/dto/update-model.dto';
import { CreateModelUseCase } from '../../application/use-cases/create-model.use-case';
import { UpdateModelUseCase } from '../../application/use-cases/update-model.use-case';
import { DeleteModelUseCase } from '../../application/use-cases/delete-model.use-case';
import { FindModelUseCase } from '../../application/use-cases/find-model.use-case';
import { ListModelsUseCase } from '../../application/use-cases/list-models.use-case';

@Controller('models')
@UseGuards(JwtAuthGuard)
export class ModelController {
  constructor(
    private readonly createModelUseCase: CreateModelUseCase,
    private readonly updateModelUseCase: UpdateModelUseCase,
    private readonly deleteModelUseCase: DeleteModelUseCase,
    private readonly findModelUseCase: FindModelUseCase,
    private readonly listModelsUseCase: ListModelsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateModelDto, @Req() req: AuthenticatedRequest) {
    return {
      data: await this.createModelUseCase.execute({
        ...dto,
        userId: req.user.sub,
      }),
    };
  }

  @Get()
  async list() {
    return { data: await this.listModelsUseCase.execute() };
  }

  @Get(':id')
  async find(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.findModelUseCase.execute(id) };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateModelDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return {
      data: await this.updateModelUseCase.execute({
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
    await this.deleteModelUseCase.execute({ id, userId: req.user.sub });
  }
}
