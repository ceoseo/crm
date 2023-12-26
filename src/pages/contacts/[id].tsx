import Head from "next/head";

import { api } from "~/utils/api";
import { Sidebar } from "~/components/sidebar/sidebar-index";
import { Breadcrumbs } from "~/components/breadcrumbs";
import { GetStaticProps, NextPage } from "next";
import { Skeleton } from "~/components/ui/skeleton";
import { ContactIndividualPage } from "~/components/contact-individual-page";
import { Button } from "~/components/ui/button";
import { Wrench } from "lucide-react";

const ContactPage: NextPage<{ id: string }> = ({ id }) => {
  const { data: contactData } = api.contact.getOne.useQuery({ id });
  return (
    <>
      <Head>
        <title>CRM / Companies </title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-grow flex-col p-5">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {!contactData && <Skeleton className="h-7 text-transparent" />}
              {!!contactData && (
                <h1 className="text-xl font-bold">
                  {contactData && contactData.name}
                </h1>
              )}
              <span className="text-sm text-muted-foreground">
                View contact details.
              </span>
            </div>
            <Button size={"sm"} variant={"outline"}>
              <Wrench className="mr-2 h-4 w-4" />
              Configure
            </Button>
          </div>
          <Breadcrumbs lastItem={contactData?.name} />
          <ContactIndividualPage contactId={id} />
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

export default ContactPage;