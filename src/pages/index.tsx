import React from "react";
import Head from "next/head";

import { api } from "~/utils/api";
import { Sidebar } from "~/components/sidebar/sidebar-index";

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>CRM</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen">
        <Sidebar />
      </div>
    </>
  );
}
