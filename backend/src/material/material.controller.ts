import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { MaterialService } from './material.service';
import { FilterQuery } from 'mongoose';

@Controller('presets') // each strategy could have its own endpoint
export class PresetController {
  constructor(private readonly service: MaterialService) {}

  @Post()
  async create(@Body() createDto: Record<string, any>) {
    return this.service.create(createDto);
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
  async update(@Param('id') id: string, @Body() updateDto: Record<string, any>) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
