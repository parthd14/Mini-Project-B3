# Placement Integrated Engine — Team A + Team B

This project combines the supplied Team A Operating Systems eligibility engine and Team B Ranking Engine into one Spring Boot application.

## What is integrated

- **Team A:** eligibility request intake, idempotency, queue strategies, rule evaluation, lifecycle/decision status, slot leases, lock/deadlock demos, metrics, health/readiness, and optional eligibility callback to Team C.
- **Team B:** candidate fetching from Team C, Merge Sort / Heap Top-K / Weighted Score ranking, skill graph structures, ranking compute and full-drive ranking endpoints, and optional ranking write-back.
- Both packages are component-scanned by the single `TeamAApplication`.
- Team A owns `/health`; Team B's component health route is `/api/v1/rankings/health` to avoid a duplicate `/health` mapping.
- Team B ranking algorithms are selected through `RankingDispatcher`; the controller does not inject the ambiguous `RankingService` interface directly.

## Run locally

Requirements: Java 17 and Maven.

From this folder (the folder containing `pom.xml`):

```powershell
mvn clean test
mvn spring-boot:run
```

The default port is `8000`. Open `http://localhost:8000/health`.

## Team B endpoints

- `GET /api/v1/rankings/health` — Team B ranking component health
- `GET /api/v1/rankings/eligible/{driveId}` — fetch eligible candidates from Team C
- `POST /api/v1/rankings/compute` — rank a candidate pool supplied in the request
- `POST /api/v1/rankings/rank/{driveId}` — fetch eligible candidates from Team C, rank them, and optionally write rankings back

Team A endpoints are listed in `openapi.yaml` and `TEAM_A_HANDOFF.md`.

## Configuration

The supplied `src/main/resources/application.properties` combines the Team A and Team B configuration.

- `PORT` — local/server port, default `8000`
- `TEAM_C_BASE_URL` — Team C backend base URL; defaults to `https://rit-placement-team-c-backend.onrender.com`
- `TEAM_C_TIMEOUT_SECONDS` — Team B's Team C HTTP timeout in seconds, default `30`
- `TEAM_A_SERVICE_TOKEN` — optional Team A service token. Keep this blank only for local development; Team A internal endpoints fail closed when no token is configured.
- `TEAM_C_CALLBACK_ENABLED` — enables Team A eligibility callbacks; default `false`
- `TEAM_C_CALLBACK_TOKEN` — optional Team A callback bearer token
- `TEAM_B_RANKING_WRITE_ENABLED` — enables Team B ranking write-back; default `false`
- `TEAM_B_RANKING_WRITE_URL` — Team C write-back URL, defaults to `https://rit-placement-team-c-backend.onrender.com/api/v1/drive-rankings`

## Important integration boundaries

- Team A receives the student snapshot and rule set in an eligibility request. It does not fetch authoritative student/drive/application data from Team C itself.
- Team B fetches candidate/application data from Team C before ranking.
- Team A callback delivery and Team B ranking write-back remain separate optional integrations.
- Team B write-back remains **disabled by default** because Team C's `POST /api/v1/drive-rankings` endpoint was reported as pending in the supplied handoff. Do not enable it until Team C confirms the route and idempotency behavior.
- A successful ranking response does not prove that rankings were persisted in MongoDB. Verify by reading the ranking record back from Team C after its write endpoint is implemented.
- The integration ZIP combines source code; it does not redeploy or change the existing Render services automatically.

## Scope of verification

The project files were merged and the source/configuration adjustments described above were made. Maven tests could not be run in the current execution environment because Maven is not installed here. Run `mvn clean test` locally and review any errors before deployment.
