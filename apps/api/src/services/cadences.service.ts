import type { Cadence } from '../types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CadencesService {
  private cadences = new Map<string, Cadence>();

  create(c: Cadence) {
    this.cadences.set(c.id, c);
  }

  get(id: string): Cadence | undefined {
    return this.cadences.get(id);
  }

  update(id: string, c: Cadence) {
    this.cadences.set(id, c);
  }
}

