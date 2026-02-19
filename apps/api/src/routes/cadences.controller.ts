import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CadencesService } from '../services/cadences.service';
import type { Cadence } from '../types';

@Controller('cadences')
export class CadencesController {
  constructor(private readonly service: CadencesService) {}

  @Post()
  create(@Body() cadence: Cadence) {
    this.service.create(cadence);
    return { ok: true };
  }

  @Get(':id')
  get(@Param('id') id: string) {
    const c = this.service.get(id);
    if (!c) {
      return { statusCode: 404, message: 'Not found' };
    }
    return c;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() cadence: Cadence) {
    this.service.update(id, cadence);
    return { ok: true };
  }
}

