import {
  Body,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Controller,
} from '@nestjs/common';
import { MaterialService } from '../material.service';
import { FilterQuery } from 'mongoose';

@Controller('material')
export abstract class BaseMaterialController {
  constructor(protected readonly service: MaterialService) {}

  @Post()
  async create(@Body() dto: Record<string, any>) {
    return this.service.create(dto);
  }

  @Get()
  async findAll(@Query() query: Record<string, any>) {
    return this.service.findAll(query as FilterQuery<any>);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Record<string, any>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
