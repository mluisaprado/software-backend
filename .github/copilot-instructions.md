<!-- .github/copilot-instructions.md: Guidance for AI coding agents working on this repo -->
# Copilot instructions — software-backend (concise)

This repository is a TypeScript Express API using Sequelize + PostgreSQL. Below are the repo-specific facts, conventions and examples that make an AI assistant productive immediately.

- Big picture
  - Entry point: `src/index.ts`. Routes are mounted with these prefixes: `/api/auth`, `/api/trips`, `/api/user`.
  - DB layer: `src/config/database.ts` exports `sequelize` and supports both `DATABASE_URL` and individual `DB_*` env vars.
  - Models live in `src/models/` and use Sequelize. Look for model hooks (e.g., `User.beforeCreate`) — password hashing is implemented via hooks.
  - Controllers return a consistent JSON shape: { success: boolean, message?: string, data?: any } and use standard HTTP status codes.

- Important scripts (from `package.json`)
  - `npm run dev` — development (ts-node-dev → runs `src/index.ts` directly)
  - `npm run build` — compile TypeScript to `dist/`
  - `npm start` — runs compiled app from `dist/`
  - `npm run seed` — runs `src/seeders/seed.ts` to populate DB
  - `npm test` — runs Jest tests (tests mock models; database is not required)

- Environment variables used by the project
  - PORT, DATABASE_URL or DB_NAME/DB_USER/DB_PASS/DB_HOST/DB_PORT, DB_DIALECT
  - JWT_SECRET — used for signing/verifying tokens
  - When suggesting changes, mention that altering DB credentials or `DATABASE_URL` may be required for local runs.

- Auth & security patterns
  - JWT tokens are created in `src/controllers/authController.ts` and verified in `src/middleware/auth.ts`.
  - Middleware expects header `Authorization: Bearer <token>`; on success it attaches `req.user` (id, email).
  - Passwords are hashed with bcrypt via Sequelize model hooks in `src/models/User.ts`. Prefer using model methods (`comparePassword`) and hooks rather than reimplementing hashing logic elsewhere.

- Conventions and patterns to follow when editing or adding code
  - Follow the existing folder structure: `routes/` → `controllers/` → `models/` → `middleware/`.
  - Controllers return the JSON object shape shown above. Mirror that shape for consistency.
  - Many handlers cast request types (e.g. `(req as any).user`) — follow the existing lightweight typing approach when necessary.
  - Sequelize models declare `tableName` explicitly and use `timestamps: true`.
  - The app currently calls `sequelize.sync({ alter: true })` on startup (in `src/index.ts`) — be careful: altering schema on startup can mutate the DB.

- Examples (copyable) — common tasks
  - Create user (register): POST /api/auth/register
    Body: { "name": "X", "email": "x@example.com", "password": "secret" }
    Response: { success: true, data: { id, name, email, token } }

  - Call protected endpoint:
    Header: Authorization: Bearer <token>

- Tests & developer workflows
  - Run tests: `npm test` (jest + ts-jest). Unit tests mock Sequelize models where appropriate.
  - Run dev server: `npm run dev` (fast edit/refresh via ts-node-dev).
  - To seed DB locally: `npm run seed` (uses `src/seeders/seed.ts`).

- Integration points & risks
  - PostgreSQL is required for full runtime; tests mock DB. When changing models or migrations, note `sequelize.sync({ alter: true })` may apply changes automatically.
  - External services: none by default, but CORS configured in `src/index.ts` contains allowed origins — update when adding frontends.

- Where to look first for common tasks
  - Add a new route: `src/routes/<name>Routes.ts` → controller `src/controllers/<name>Controller.ts` → model in `src/models/`.
  - Auth logic: `src/controllers/authController.ts`, `src/middleware/auth.ts`.
  - DB connection options and retries: `src/config/database.ts`.

If anything above is unclear or you'd like me to expand examples (request/response samples, common refactors, or tests to add), tell me which area and I’ll iterate. 
