import Head from "next/head";
import { Breadcrumbs } from "~/components/breadcrumbs";
import { AddCompany } from "~/components/create/create-company";
import { Layout } from "~/components/layout";
import { useSession } from "next-auth/react";
import type { Company, CompanyPolicy } from "@prisma/client";
import { Contact, Loader2, Trash } from "lucide-react";
import { useState } from "react";
import { CanDoOperation } from "~/utils/policy";
import { api } from "~/utils/api";
// import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import initials from "initials";
// import { Calendar } from "lucide-react";
import { cn } from "~/utils/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { ContactCard, ProjectCard } from "~/components/hover-cards";
dayjs.extend(advancedFormat);

export default function Companies() {
  const { data: session } = useSession();
  return (
    <>
      <Head>
        <title>CRM / Companies</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex flex-grow flex-col p-5">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold">Companies</h1>
              <span className="text-muted-foreground text-sm">
                View all companies.
              </span>
            </div>
            {CanDoOperation({
              session,
              entity: "company",
              operation: "create",
            }) && <AddCompany />}
          </div>
          <Breadcrumbs />
          <CompanyPageTable />
        </div>
      </Layout>
    </>
  );
}

const CompanyPageTable = () => {
  const { data: companies } = api.company.getAll.useQuery({
    include: {
      lastActivity: true,
      policies: true,
      contacts: true,
      projects: true,
      count: {
        contacts: true,
        projects: true,
      },
    },
  });

  const MAX_PROJECTS = 4;
  const MAX_CONTACTS = 4;

  return (
    <>
      <div className="mt-3 flex flex-col overflow-hidden rounded-md border">
        {!companies && (
          <>
            <div className="flex items-center gap-2 border-b px-2 py-3 sm:px-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 flex-grow rounded-md" />
            </div>
            <div className="flex items-center gap-2 px-2 py-3 sm:px-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 flex-grow rounded-md" />
            </div>
          </>
        )}
        {!!companies && !companies.length && (
          <>
            <div className="text-muted-foreground flex h-24 items-center justify-center text-sm">
              No companies
            </div>
          </>
        )}
        {companies?.map((company) => {
          return (
            <Link
              passHref={true}
              href={`/companies/${company.id}`}
              key={company.id}
              className="hover:bg-muted/50 flex justify-between gap-2 border-b transition-colors last:border-none hover:cursor-pointer"
            >
              <div className="flex flex-col gap-1 px-2 py-3 sm:px-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 text-xs">
                    <AvatarImage src={company.image ?? ""} />
                    <AvatarFallback>
                      {initials(company.name).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate font-semibold">{company.name}</span>
                </div>
                {/* {!!company.activities?.[0] && (
                    <Badge variant={"outline"}>
                      <span className="text-muted-foreground">
                        Last contact:
                      </span>
                      <span className="font-medium">
                        {dayjs().to(company.activities?.[0]?.date)} &#x2022;{" "}
                        {dayjs(company.activities?.[0]?.date).format(
                          "MMMM Do, YYYY"
                        )}
                      </span>
                    </Badge>
                  )} */}
                {(!!company.info || !!company.field) && (
                  <div className="flex items-center gap-1 text-sm">
                    {company.info}{" "}
                    {company.info && company.field && <>&#x2022;</>}{" "}
                    {company.field}
                  </div>
                )}
                <div className="mt-1 flex gap-2 empty:hidden">
                  {/* {!!company._count.contacts && (
                    <Badge variant={"outline"}>
                      {company._count.contacts}{" "}
                      {company._count.contacts === 1 ? "contact" : "contacts"}
                    </Badge>
                  )}
                  {!!company._count.projects && (
                    <Badge variant={"outline"}>
                      {company._count.projects}{" "}
                      {company._count.projects === 1 ? "project" : "projects"}
                    </Badge>
                  )} */}
                  <div
                    className={cn("flex items-center gap-0", {
                      hidden: company.projects.length < 1,
                    })}
                  >
                    {company.projects
                      .slice(
                        0,
                        company._count.projects <= MAX_PROJECTS
                          ? MAX_PROJECTS
                          : MAX_PROJECTS - 1,
                      )
                      .map((project) => {
                        return (
                          <ProjectCard project={project}>
                            <Avatar className="-ml-2 h-[26px] w-[26px] border first:ml-0">
                              <AvatarImage src={project.image!} />
                              <AvatarFallback className="text-[10px]">
                                {initials(project.name).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </ProjectCard>
                        );
                      })}
                    {company._count.projects > MAX_PROJECTS && (
                      <>
                        <Avatar className="-ml-2.5 h-[26px] w-[26px] border first:ml-0">
                          <AvatarFallback className="text-[10px]">
                            {company._count.projects - MAX_PROJECTS > 9
                              ? "9+"
                              : "+" +
                                (company._count.projects - (MAX_PROJECTS - 1))}
                          </AvatarFallback>
                        </Avatar>
                      </>
                    )}
                    <span className="text-muted-foreground ml-1.5 text-xs italic">
                      {company._count.projects}{" "}
                      {company._count.projects > 1 ? "projects" : "project"}
                    </span>
                  </div>
                  <div
                    className={cn("flex items-center gap-0", {
                      hidden: company.contacts.length < 1,
                    })}
                  >
                    {company.contacts
                      .slice(
                        0,
                        company._count.contacts <= MAX_CONTACTS
                          ? MAX_CONTACTS
                          : MAX_CONTACTS - 1,
                      )
                      .map((contact) => {
                        return (
                          <ContactCard contact={contact}>
                            <Avatar className="-ml-2 h-[26px] w-[26px] border first:ml-0">
                              <AvatarImage src={contact.image!} />
                              <AvatarFallback className="text-[10px]">
                                {initials(contact.name).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </ContactCard>
                        );
                      })}
                    {company._count.contacts > MAX_CONTACTS && (
                      <>
                        <Avatar className="-ml-2.5 h-[26px] w-[26px] border first:ml-0">
                          <AvatarFallback className="text-[10px]">
                            {company._count.contacts - MAX_CONTACTS > 9
                              ? "9+"
                              : "+" +
                                (company._count.contacts - (MAX_CONTACTS - 1))}
                          </AvatarFallback>
                        </Avatar>
                      </>
                    )}
                    <span className="text-muted-foreground ml-1.5 text-xs italic">
                      {company._count.contacts}{" "}
                      {company._count.contacts > 1 ? "contacts" : "contact"}
                    </span>
                  </div>
                  {/* {!!company.createdAt && (
                    <Badge variant={"secondary"}>
                      <Calendar className="h-3 w-3" />
                      {dayjs(company.createdAt).format("MMMM Do, YYYY")}
                    </Badge>
                  )} */}
                </div>
              </div>
              <CompanyPageTableEdit company={company} />
            </Link>
          );
        })}
      </div>
    </>
  );
};

const CompanyPageTableEdit = ({
  company,
}: {
  company: Company & { policies: CompanyPolicy[] };
}) => {
  const { data: sessionData } = useSession();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const ctx = api.useUtils();

  const { mutate: deleteProject } = api.company.delete.useMutation({
    onMutate: () => {
      setDeleteLoading(true);
    },
    onSuccess: () => {
      void ctx.company.getAll.invalidate();
    },
    onError: () => {
      setDeleteLoading(false);
    },
  });

  return (
    <div className="flex flex-col items-center justify-center px-4 py-4 sm:px-6">
      <div key={`cpte-${company.id}`} className="flex">
        {CanDoOperation({
          session: sessionData,
          policies: company.policies,
          entity: "company",
          operation: "delete",
        }) && (
          <>
            <div
              className="hover:bg-accent box-content h-4 w-4 cursor-pointer rounded-md border p-2 text-red-500 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                !deleteLoading && deleteProject({ id: company.id });
              }}
            >
              {!deleteLoading ? (
                <Trash className="h-4 w-4" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </div>
            {/* <div className="box-content cursor-pointer rounded-r-md border p-2 text-muted-foreground transition-colors hover:bg-accent">
          <Pencil className="h-4 w-4" />
        </div> */}
          </>
        )}
      </div>
    </div>
  );
};
