import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { PolicyQuery } from "~/utils/policyQuery";

export const contactRotuer = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z
        .object({
          include: z
            .object({
              user: z.boolean().default(false).optional(),
              companies: z.boolean().default(false).optional(),
              activities: z.boolean().default(false).optional(),
              projects: z.boolean().default(false).optional(),
              policies: z.boolean().default(false).optional(),
              relations: z.boolean().default(false).optional(),
            })
            .optional(),
        })
        .optional()
    )
    .query(({ ctx, input }) => {
      return ctx.db.contact.findMany({
        where: {
          headId: ctx.session.user.head.id,
          // POLICY
          ...PolicyQuery({
            session: ctx.session,
            entity: "contact",
            operation: "read",
          }),
        },
        include: {
          user: input?.include?.user,
          companies: input?.include?.companies
            ? {
                where: {
                  ...PolicyQuery({
                    session: ctx.session,
                    entity: "company",
                    operation: "read",
                  }),
                },
              }
            : {},
          activities: input?.include?.activities
            ? {
                orderBy: {
                  date: "desc",
                },
              }
            : false,
          projects: input?.include?.projects,
          policies: input?.include?.policies
            ? {
                where: {
                  userId: ctx.session.user.id,
                },
              }
            : {},
          incomingRelations: input?.include?.relations,
          outgoingRelations: input?.include?.relations,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  get: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        include: z
          .object({
            user: z.boolean().default(false).optional(),
            companies: z.boolean().default(false).optional(),
            activities: z.boolean().default(false).optional(),
            projects: z.boolean().default(false).optional(),
            relations: z.boolean().default(false).optional(),
          })
          .optional(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.db.contact.findFirst({
        where: {
          headId: ctx.session.user.head.id,
          id: input.id,
          // POLICY
          ...PolicyQuery({
            session: ctx.session,
            entity: "contact",
            operation: "read",
          }),
        },
        include: {
          user: input.include?.user,
          companies:
            input.include?.activities && input.include.companies
              ? {
                  include: {
                    _count: {
                      select: {
                        contacts: true,
                        projects: true,
                      },
                    },
                    activities: {
                      where: {
                        contacts: {
                          none: {
                            id: input.id,
                          },
                        },
                        projects: {
                          none: {
                            contacts: {
                              some: {
                                id: input.id,
                              },
                            },
                          },
                        },
                      },
                      orderBy: {
                        date: "desc",
                      },
                    },
                  },
                }
              : input.include?.companies,
          activities: input.include?.activities
            ? {
                orderBy: {
                  date: "desc",
                },
              }
            : false,
          projects:
            input.include?.activities && input.include.projects
              ? {
                  include: {
                    _count: {
                      select: {
                        contacts: true,
                        companies: true,
                      },
                    },
                    activities: {
                      where: {
                        contacts: {
                          none: {
                            id: input.id,
                          },
                        },
                      },
                      orderBy: {
                        date: "desc",
                      },
                    },
                  },
                }
              : input.include?.projects,
          incomingRelations: true,
          outgoingRelations: true,
        },
      });
    }),

  add: protectedProcedure
    .input(
      z.object({
        contactData: z.object({
          name: z.string().min(2).max(50),
          email: z.union([z.string().email().optional(), z.literal("")]),
          companyIds: z.array(z.string()).optional(),
          info: z.union([z.string().max(200).optional(), z.literal("")]),
          mobile: z.string().optional(),
        }),
      })
    )
    .mutation(({ ctx, input }) => {
      // POLICY
      if (!ctx.session.user.role.canCreateContact) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.db.contact.create({
        data: {
          headId: ctx.session.user.head.id,
          name: input.contactData.name,
          email: input.contactData.email,
          info: input.contactData.info,
          mobile: input.contactData.mobile,
          companies: {
            connect: input.contactData.companyIds?.map((id) => {
              return {
                headId: ctx.session.user.head.id,
                id,
              };
            }),
          },
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.contact.delete({
        where: {
          headId: ctx.session.user.head.id,
          id: input.id,
          // POLICY
          ...PolicyQuery({
            session: ctx.session,
            entity: "contact",
            operation: "delete",
          }),
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string().min(2).max(50),
          email: z.union([z.string().email().optional(), z.literal("")]),
          companyIds: z.array(z.string()).optional(),
          info: z.union([z.string().max(200).optional(), z.literal("")]),
          mobile: z.string().optional(),
        }),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.contact.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.id,
          // POLICY
          ...PolicyQuery({
            session: ctx.session,
            entity: "contact",
            operation: "edit",
          }),
        },
        data: {
          name: input.data.name,
          email: input.data.email,
          info: input.data.info,
          mobile: input.data.mobile,
          companies: {
            connect: input.data.companyIds?.map((id) => {
              return {
                headId: ctx.session.user.head.id,
                id,
              };
            }),
          },
        },
      });
    }),

  addLink: protectedProcedure
    .input(
      z.object({
        contactOne: z.string(),
        contactTwo: z.string(),
        mode: z.number(),
      })
    )
    .mutation(({ ctx, input }) => {
      if (input.contactOne == input.contactTwo) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      return ctx.db.contact.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.contactOne,
          // POLICY
          ...PolicyQuery({
            session: ctx.session,
            entity: "contact",
            operation: "edit",
          }),
        },
        data: {
          outgoingRelations:
            input.mode == 0 || input.mode == 1
              ? {
                  connect: {
                    id: input.contactTwo,
                    ...PolicyQuery({
                      session: ctx.session,
                      entity: "contact",
                      operation: "edit",
                    }),
                  },
                }
              : {},
          incomingRelations:
            input.mode == 0 || input.mode == 2
              ? {
                  connect: {
                    id: input.contactTwo,
                    ...PolicyQuery({
                      session: ctx.session,
                      entity: "contact",
                      operation: "edit",
                    }),
                  },
                }
              : {},
        },
      });
    }),

  deleteLink: protectedProcedure
    .input(
      z.object({
        contactOne: z.string(),
        contactTwo: z.string(),
        mode: z.number(),
      })
    )
    .mutation(({ ctx, input }) => {
      if (input.contactOne == input.contactTwo) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      return ctx.db.contact.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.contactOne,
          // POLICY
          ...PolicyQuery({
            session: ctx.session,
            entity: "contact",
            operation: "edit",
          }),
        },
        data: {
          outgoingRelations:
            input.mode == 0 || input.mode == 1
              ? {
                  disconnect: {
                    id: input.contactTwo,
                  },
                }
              : {},
          incomingRelations:
            input.mode == 0 || input.mode == 2
              ? {
                  disconnect: {
                    id: input.contactTwo,
                  },
                }
              : {},
        },
      });
    }),

  addCompany: protectedProcedure
    .input(
      z.object({
        companyIds: z.array(z.string()),
        contactId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log(
        JSON.stringify(
          PolicyQuery({
            session: ctx.session,
            entity: "contact",
            operation: "edit",
          })
        )
      );
      return ctx.db.contact.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.contactId,
          // POLICY
          ...PolicyQuery({
            session: ctx.session,
            entity: "contact",
            operation: "edit",
          }),
        },
        data: {
          companies: {
            connect: input.companyIds.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
            })),
          },
        },
      });
    }),

  deleteCompany: protectedProcedure
    .input(
      z.object({
        companyIds: z.array(z.string()),
        contactId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.contact.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.contactId,
          // POLICY
          ...PolicyQuery({
            session: ctx.session,
            entity: "contact",
            operation: "edit",
          }),
        },
        data: {
          companies: {
            disconnect: input.companyIds.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
            })),
          },
        },
      });
    }),

  addProject: protectedProcedure
    .input(
      z.object({
        projectIds: z.array(z.string()),
        contactId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.contact.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.contactId,
          // POLICY
          ...PolicyQuery({
            session: ctx.session,
            entity: "contact",
            operation: "edit",
          }),
        },
        data: {
          projects: {
            connect: input.projectIds.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
            })),
          },
        },
      });
    }),

  deleteProject: protectedProcedure
    .input(
      z.object({
        projectIds: z.array(z.string()),
        contactId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.contact.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.contactId,
          // POLICY
          ...PolicyQuery({
            session: ctx.session,
            entity: "contact",
            operation: "edit",
          }),
        },
        data: {
          projects: {
            disconnect: input.projectIds.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
            })),
          },
        },
      });
    }),
});
