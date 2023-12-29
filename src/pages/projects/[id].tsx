import Head from "next/head";
import { api } from "~/utils/api";
import { Breadcrumbs } from "~/components/breadcrumbs";
import type { NextPage } from "next";
import { Skeleton } from "~/components/ui/skeleton";
import { ProjectIndividualPage } from "~/components/individual-page/project-indiviual-page";
import { Button } from "~/components/ui/button";
import { Wrench } from "lucide-react";
import { Layout } from "~/components/layout";

const ProjectPage: NextPage<{ id: string }> = ({ id }) => {
  const { data: projectData, isLoading } = api.project.getOne.useQuery({ id });

  if (isLoading) {
    console.log("is loading!!!");
  }

  return (
    <>
      <Head>
        <title>CRM / Projects </title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex flex-grow flex-col p-5">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {!projectData && <Skeleton className="h-7 text-transparent" />}
              {!!projectData && (
                <h1 className="text-xl font-bold">{projectData.name}</h1>
              )}
              <span className="text-sm text-muted-foreground">
                View project details.
              </span>
            </div>
            <Button size={"sm"} variant={"outline"}>
              <Wrench className="mr-2 h-4 w-4" />
              Configure
            </Button>
          </div>
          <Breadcrumbs lastItem={projectData?.name ?? "..."} />
          <ProjectIndividualPage projectId={id} />
        </div>
      </Layout>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import type { GetServerSidePropsContext } from "next";
import superjson from "superjson";
import { appRouter } from "~/server/api/root";
import { getSession } from "next-auth/react";
import { db } from "~/server/db";

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string }>,
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, session: await getSession(context) },
    transformer: superjson,
  });
  const id = context.params?.id ?? "";
  /*
   * Prefetching the `post.byId` query.
   * `prefetch` does not return the result and never throws - if you need that behavior, use `fetch` instead.
   */
  await helpers.project.getOne.fetch({ id });
  // Make sure to return { props: { trpcState: helpers.dehydrate() } }
  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
  };
}

export default ProjectPage;
