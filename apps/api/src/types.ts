export type SendEmailStep = {
  id: string;
  type: 'SEND_EMAIL';
  subject: string;
  body: string;
};

export type WaitStep = {
  id: string;
  type: 'WAIT';
  seconds: number;
};

export type Cadence = {
  id: string;
  name: string;
  steps: Array<SendEmailStep | WaitStep>;
};

export type WorkflowState = {
  currentStepIndex: number;
  stepsVersion: number;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
};
