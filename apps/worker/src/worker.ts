import { Worker } from '@temporalio/worker';
import * as activities from './activities';

async function run() {
  const taskQueue = process.env.TEMPORAL_TASK_QUEUE || 'EMAIL_CADENCE_QUEUE';
  const workflowsPath = require.resolve('./workflows');
  // eslint-disable-next-line no-console
  console.log(`Starting Temporal Worker. Task Queue: ${taskQueue}`);
  const worker = await Worker.create({
    taskQueue,
    workflowsPath,
    activities
  });
  await worker.run();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

