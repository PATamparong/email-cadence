# Email Cadence Monorepo (Next.js + NestJS + Temporal.io)

Small full-stack app demonstrating an email cadence executed by a Temporal workflow with runtime updates.

## Stack
- Next.js (apps/web)
- NestJS (apps/api)
- Temporal.io TypeScript SDK (apps/worker)
- TypeScript Monorepo (npm workspaces)

## Monorepo Structure
```
repo/
  apps/
    web/        # Next.js
    api/        # NestJS
    worker/     # Temporal Worker
  package.json
  tsconfig.base.json
  README.md
```

## Install
```bash
cd email-cadence
npm install
```

## Temporal Setup

### 1. Install the Temporal CLI

```bash
# macOS
brew install temporal

# Other platforms: https://docs.temporal.io/cli#install
```

### 2. Start the local Temporal dev server

```bash
temporal server start-dev
```

This starts:
- Temporal server at `localhost:7233`
- Web UI at `http://localhost:8233`

> The dev server is ephemeral — workflow history is lost on restart. For persistent storage, pass `--db-filename temporal.db`.

### 3. Configuration

Set via environment variables (see each app's `.env.example`):

| Variable | Default | Used by |
|---|---|---|
| `TEMPORAL_ADDRESS` | `localhost:7233` | api, worker |
| `TEMPORAL_NAMESPACE` | `default` | api, worker |
| `TEMPORAL_TASK_QUEUE` | `EMAIL_CADENCE_QUEUE` | api, worker |

## Run
- API: `npm run dev:api` (http://localhost:3001)
- Worker: `npm run dev:worker`
- Web: `npm run dev:web` (http://localhost:3000)

Or run all in parallel:
```bash
npm run dev
```

## API Endpoints
### Cadences
- POST `/cadences` – Create cadence
  - Body: `{ "id": "cad_123", "name": "Welcome Flow", "steps": [...] }`
- GET `/cadences/:id` – Get cadence
- PUT `/cadences/:id` – Update cadence definition

### Enrollments
- POST `/enrollments`
  - Body: `{ "cadenceId": "cad_123", "contactEmail": "user@example.com" }`
  - Starts Temporal workflow, returns `{ "id": "enr_..." }`
- GET `/enrollments/:id`
  - Returns workflow state: `{ "currentStepIndex": number, "stepsVersion": number, "status": "RUNNING|COMPLETED|FAILED" }`
- POST `/enrollments/:id/update-cadence`
  - Body: `{ "steps": [...] }`
  - Sends Temporal signal to update the running workflow

## Cadence Payload Contract
The entire system uses this exact JSON structure:
```json
{
  "id": "cad_123",
  "name": "Welcome Flow",
  "steps": [
    { "id": "1", "type": "SEND_EMAIL", "subject": "Welcome", "body": "Hello there" },
    { "id": "2", "type": "WAIT", "seconds": 10 },
    { "id": "3", "type": "SEND_EMAIL", "subject": "Follow up", "body": "Checking in" }
  ]
}
```

## Notes
- Email sending is a mock activity that logs and always returns success.
- No authentication and no tests included by design.
- UI uses a simple JSON editor to manage cadences, start workflows, poll state, and send updates.

