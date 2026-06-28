import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const passwordResetTokens = sqliteTable('password_reset_tokens', {
    email: text('email').primaryKey(),
    token: text('token').notNull(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const provinces = sqliteTable('provinces', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
});

export const localities = sqliteTable('localities', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    provinceId: integer('province_id')
        .notNull()
        .references(() => provinces.id),
});

export const disciplines = sqliteTable('disciplines', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull().unique(),
    description: text('description'),
});

export const races = sqliteTable('races', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    disciplineId: integer('discipline_id')
        .notNull()
        .references(() => disciplines.id),
    description: text('description'),
    image: text('image'),
    place: text('place'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const editions = sqliteTable('editions', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    raceId: integer('race_id')
        .notNull()
        .references(() => races.id, { onDelete: 'cascade' }),
    startDate: text('start_date').notNull(),
    endDate: text('end_date').notNull(),
    distances: text('distances').notNull().default('[]'),
    image: text('image'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const places = sqliteTable('places', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    raceId: integer('race_id')
        .notNull()
        .references(() => races.id, { onDelete: 'cascade' }),
    provinceId: integer('province_id')
        .notNull()
        .references(() => provinces.id),
    localityId: integer('locality_id').references(() => localities.id),
    place: text('place'),
});

export const links = sqliteTable('links', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    raceId: integer('race_id')
        .notNull()
        .references(() => races.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    title: text('title'),
    url: text('url'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Race = typeof races.$inferSelect;
export type Edition = typeof editions.$inferSelect;
export type Discipline = typeof disciplines.$inferSelect;
export type Province = typeof provinces.$inferSelect;
export type Locality = typeof localities.$inferSelect;
export type Place = typeof places.$inferSelect;
export type Link = typeof links.$inferSelect;
