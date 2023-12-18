import { and, desc, eq, sql } from "drizzle-orm";
import { companies, contacts } from "drizzle/schema";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const companyRotuer = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.companies.findMany({
      orderBy: (company) => [desc(company.createdAt)],
    });
  }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.companies.findFirst({
        where: and(
          eq(companies.id, input.id),
          eq(companies.headId, ctx.session.user.head.id),
        ),
      });
    }),

  getCompanyContacts: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.contacts.findMany({
        where: and(
          eq(contacts.companyId, input.id),
          eq(contacts.headId, ctx.session.user.head.id),
        ),
      });
    }),

  getCompanyProjects: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.companies.findFirst({
        where: and(
          eq(companies.id, input.id),
          eq(companies.headId, ctx.session.user.head.id),
        ),
        with: {
          projects: {
            with: {
              project: true,
            },
          },
        },
      });
    }),
});
