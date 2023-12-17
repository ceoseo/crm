import Head from "next/head";

import { api } from "~/utils/api";
import { Sidebar } from "~/components/sidebar/sidebar-index";
import { Breadcrumbs } from "~/components/breadcrumbs";
import { GetStaticProps, NextPage } from "next";
import { Skeleton } from "~/components/ui/skeleton";
import { CompanyIndividualPage } from "~/components/company-individual-page";

const CompanyPage: NextPage<{ id: string }> = ({ id }) => {
  const { data: companyData } = api.company.getOne.useQuery({ id });
  return (
    <>
      <Head>
        <title>CRM / Companies </title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-grow flex-col p-5">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {!companyData && <Skeleton className="h-7 text-transparent" />}
              {!!companyData && (
                <h1 className="text-xl font-bold">
                  {companyData && companyData.name}
                </h1>
              )}
              <span className="text-sm text-muted-foreground">
                View company details.
              </span>
            </div>
          </div>
          <Breadcrumbs lastItem={companyData?.name ?? id} />
          <CompanyIndividualPage companyId={id} companyData={companyData} />
        </div>
      </div>
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

export default CompanyPage;
