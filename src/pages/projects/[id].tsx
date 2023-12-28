import Head from "next/head";
import { api } from "~/utils/api";
import { Sidebar } from "~/components/sidebar/sidebar-index";
import { Breadcrumbs } from "~/components/breadcrumbs";
import { GetStaticProps, NextPage } from "next";
import { Skeleton } from "~/components/ui/skeleton";
import { ProjectIndividualPage } from "~/components/individual-page/project-indiviual-page";
import { Button } from "~/components/ui/button";
import { Wrench } from "lucide-react";
import { Layout } from "~/components/layout";

const ProjectPage: NextPage<{ id: string }> = ({ id }) => {
  const { data: projectData } = api.project.getOne.useQuery({ id });
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
                <h1 className="text-xl font-bold">
                  {projectData && projectData.name}
                </h1>
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

export const getStaticProps: GetStaticProps = (context) => {
  const id = context.params?.id;

  if (typeof id != "string") throw new Error("no id provided");

  return {
    props: {
      id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProjectPage;
