import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const todosTable = sqliteTable("todos", {
  id: int("id").primaryKey({ autoIncrement: true }).notNull(),
  title: text("title").notNull(),
  isCompleted: int("isCompleted").default(0).notNull(),
});
