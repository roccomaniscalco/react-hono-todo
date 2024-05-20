import { DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { todosTable } from "../../database/schema";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";

type Bindings = {
  DB: D1Database;
};

type Variables = {
  db: DrizzleD1Database;
};

const api = new Hono<{ Bindings: Bindings; Variables: Variables }>()
  .basePath("/api")
  // attach db to context
  .use(async (c, next) => {
    const db = drizzle(c.env.DB);
    c.set("db", db);
    await next();
  })
  .get("/todos", async (c) => {
    const todos = await c.var.db.select().from(todosTable).all();
    return c.json(todos);
  })
  .post(
    "/todo",
    zValidator("json", z.object({ title: z.string() })),
    async (c) => {
      const { title } = c.req.valid("json");
      const todo = await c.var.db.insert(todosTable).values({ title });
      return c.json(todo);
    }
  )
  .put(
    "/todo/:id",
    zValidator("json", z.object({ isCompleted: z.boolean() })),
    async (c) => {
      const id = Number(c.req.param("id"));
      const { isCompleted } = c.req.valid("json");
      const todo = await c.var.db
        .update(todosTable)
        .set({ isCompleted: isCompleted ? 1 : 0 })
        .where(eq(todosTable.id, id));
      return c.json(todo);
    }
  );

export type ApiType = typeof api;

export const onRequest = handle(api);
