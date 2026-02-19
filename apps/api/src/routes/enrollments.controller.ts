import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EnrollmentsService } from '../services/enrollments.service';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  @Post()
  async create(@Body() body: { cadenceId: string; contactEmail: string }) {
    const id = await this.service.startEnrollment(body.cadenceId, body.contactEmail);
    return { id };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const state = await this.service.getState(id);
    return state ?? { statusCode: 404, message: 'Not found' };
  }

  @Post(':id/update-cadence')
  async update(@Param('id') id: string, @Body() body: { steps: any[] }) {
    await this.service.updateCadence(id, body.steps);
    return { ok: true };
  }
}

