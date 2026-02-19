import { proxyActivities, defineSignal, defineQuery, setHandler, sleep } from '@temporalio/workflow';
import type { Cadence, WorkflowState } from './types';

const { sendEmail } = proxyActivities<{ sendEmail: (args: { to: string; subject: string; body: string }) => Promise<any> }>({
  startToCloseTimeout: '1 minute'
});

export interface WorkflowArgs {
  cadence: Cadence;
  contactEmail: string;
  enrollmentId: string;
}

export const updateCadenceSignal = defineSignal<[Cadence['steps']]>('updateCadence');
export const getStateQuery = defineQuery<WorkflowState, []>('getState');

export async function emailCadenceWorkflow(args: WorkflowArgs): Promise<void> {
  let steps = args.cadence.steps.slice();
  const state: WorkflowState = {
    currentStepIndex: 0,
    stepsVersion: 1,
    status: 'RUNNING'
  };

  setHandler(getStateQuery, () => ({
    currentStepIndex: state.currentStepIndex,
    stepsVersion: state.stepsVersion,
    status: state.status
  }));

  setHandler(updateCadenceSignal, (newSteps: Cadence['steps']) => {
    if (newSteps.length <= state.currentStepIndex) {
      steps = newSteps;
      state.stepsVersion += 1;
      state.status = 'COMPLETED';
      return;
    }
    steps = newSteps;
    state.stepsVersion += 1;
  });

  while (state.status === 'RUNNING' && state.currentStepIndex < steps.length) {
    const step = steps[state.currentStepIndex] as any;
    if (step.type === 'SEND_EMAIL') {
      await sendEmail({ to: args.contactEmail, subject: step.subject, body: step.body });
    } else if (step.type === 'WAIT') {
      await sleep(step.seconds * 1000);
    }
    state.currentStepIndex += 1;
    if (state.currentStepIndex >= steps.length) {
      state.status = 'COMPLETED';
    }
  }
}
