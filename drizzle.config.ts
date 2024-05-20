import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "database/schema.ts",
  dialect: "sqlite",
  out: ".drizzle",
  driver: "d1",
  dbCredentials: {
    wranglerConfigPath: "wrangler.toml",
    dbName: "todo-db",
  },
});
