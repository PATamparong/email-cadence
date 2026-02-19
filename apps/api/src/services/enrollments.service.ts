import { Injectable } from '@nestjs/common';
import type { Cadence, WorkflowState } from '../types';
import { CadencesService } from './cadences.service';
import { Connection, Client, WorkflowHandle } from '@temporalio/client';

type EnrollmentInfo = {
  id: string;
  workflowId: string;
  cadenceId: string;
  contactEmail: string;
};

@Injectable()
export class EnrollmentsService {
  private enrollments = new Map<string, EnrollmentInfo>();

  constructor(private readonly cadences: CadencesService) {}

  private async client(): Promise<Client> {
    const address = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
    const namespace = process.env.TEMPORAL_NAMESPACE || 'default';
    const connection = await Connection.connect({ address });
    return new Client({ connection, namespace });
  }

  private taskQueue() {
    return process.env.TEMPORAL_TASK_QUEUE || 'EMAIL_CADENCE_QUEUE';
  }

  async startEnrollment(cadenceId: string, contactEmail: string): Promise<string> {
    const cadence = this.cadences.get(cadenceId);
    if (!cadence) throw new Error('Cadence not found');
    const client = await this.client();
    const id = `enr_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const workflowId = `enrollment_${id}`;
    await client.workflow.start('emailCadenceWorkflow', {
      args: [{ cadence, contactEmail, enrollmentId: id }],
      taskQueue: this.taskQueue(),
      workflowId
    });
    this.enrollments.set(id, { id, workflowId, cadenceId, contactEmail });
    return id;
  }

  private async getHandleByEnrollment(id: string): Promise<WorkflowHandle | null> {
    const info = this.enrollments.get(id);
    if (!info) return null;
    const client = await this.client();
    return client.workflow.getHandle(info.workflowId);
  }

  async getState(id: string): Promise<WorkflowState | null> {
    const handle = await this.getHandleByEnrollment(id);
    if (!handle) return null;
    try {
      const state = await handle.query<WorkflowState>('getState');
      return state;
    } catch (e) {
      return null;
    }
  }

  async updateCadence(id: string, steps: Cadence['steps']): Promise<void> {
    const handle = await this.getHandleByEnrollment(id);
    if (!handle) throw new Error('Enrollment not found');
    await handle.signal('updateCadence', steps);
  }
}

