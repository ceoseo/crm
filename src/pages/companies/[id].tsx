import Head from "next/head";

import { api } from "~/utils/api";
import { Breadcrumbs } from "~/components/breadcrumbs";
import type { GetStaticProps, NextPage } from "next";
import { Skeleton } from "~/components/ui/skeleton";
import { CompanyIndividualPage } from "~/components/individual-page/company-individual-page";
import { Layout } from "~/components/layout";
import { EditCompany } from "~/components/individual-page/edit-button/edit-company";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import initials from "initials";
import { CanDoOperation } from "~/utils/policyQuery";
import { useSession } from "next-auth/react";

const CompanyPage: NextPage<{ id: string }> = ({ id }) => {
  const { data: companyData, isLoading } = api.company.get.useQuery({
    id,
    include: {
      contacts: true,
      projects: true,
      activities: true,
    },
  });

  const { data: session } = useSession();

  if (isLoading) {
    console.log("is loading!!!");
  }

  return (
    <>
      <Head>
        <title>CRM / Companies </title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex flex-grow flex-col p-5">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-12 w-12 text-lg">
                <AvatarImage src={companyData?.image ?? ""} alt="" />
                <AvatarFallback>
                  {initials(companyData?.name ?? "").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                {!companyData && <Skeleton className="h-7 text-transparent" />}
                {!!companyData && (
                  <h1 className="text-xl font-bold">{companyData.name}</h1>
                )}
                <span className="text-sm text-muted-foreground">
                  {!!companyData?.info?.length || companyData?.field?.length ? (
                    <>
                      {companyData.info}{" "}
                      {companyData.info && companyData.field && <>&#x2022;</>}{" "}
                      {companyData.field}
                    </>
                  ) : (
                    <>View contact details.</>
                  )}
                </span>
              </div>
            </div>
            {CanDoOperation({
              session,
              entity: "company",
              operation: "edit",
              policies: companyData?.policies,
            }) && <EditCompany company={companyData ?? null} />}
          </div>
          <Breadcrumbs lastItem={companyData?.name ?? id} />
          <CompanyIndividualPage companyId={id} company={companyData ?? null} />
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

export default CompanyPage;
