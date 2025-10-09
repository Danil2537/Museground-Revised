import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { MaterialService } from 'src/material/material.service';
import { Document } from 'mongoose';

export function MaterialController<T extends Document>(prefix: string) {
  @Controller(prefix)
  class GenericController {
    constructor(readonly service: MaterialService<T>) {}

    @Post()
    create(@Body() dto: any): Promise<T> {
      return this.service.createMaterial(dto);
    }

    @Get()
    findAll(): Promise<T[]> {
      return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<T | null> {
      return this.service.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: any): Promise<T | null> {
      return this.service.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string): Promise<T | null> {
      return this.service.delete(id);
    }
  }

  return GenericController;
}
