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
import { CreateBrandDto } from '../../application/dto/create-brand.dto';
import { UpdateBrandDto } from '../../application/dto/update-brand.dto';
import { CreateBrandUseCase } from '../../application/use-cases/create-brand.use-case';
import { UpdateBrandUseCase } from '../../application/use-cases/update-brand.use-case';
import { DeleteBrandUseCase } from '../../application/use-cases/delete-brand.use-case';
import { FindBrandUseCase } from '../../application/use-cases/find-brand.use-case';
import { ListBrandsUseCase } from '../../application/use-cases/list-brands.use-case';

@Controller('brands')
@UseGuards(JwtAuthGuard)
export class BrandController {
  constructor(
    private readonly createBrandUseCase: CreateBrandUseCase,
    private readonly updateBrandUseCase: UpdateBrandUseCase,
    private readonly deleteBrandUseCase: DeleteBrandUseCase,
    private readonly findBrandUseCase: FindBrandUseCase,
    private readonly listBrandsUseCase: ListBrandsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateBrandDto, @Req() req: AuthenticatedRequest) {
    return { data: await this.createBrandUseCase.execute({ ...dto, userId: req.user.sub }) };
  }

  @Get()
  async list() {
    return { data: await this.listBrandsUseCase.execute() };
  }

  @Get(':id')
  async find(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.findBrandUseCase.execute(id) };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBrandDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return {
      data: await this.updateBrandUseCase.execute({ id, ...dto, userId: req.user.sub }),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    await this.deleteBrandUseCase.execute({ id, userId: req.user.sub });
  }
}
