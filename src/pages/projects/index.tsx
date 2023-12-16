import React from "react";
import Head from "next/head";

import { api } from "~/utils/api";
import { Sidebar } from "~/components/sidebar/sidebar-index";
import { usePathname } from "next/navigation";

export default function Projects() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>projects</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-grow flex-col items-center justify-center">
          <span>{usePathname()}</span>
          <span>{hello.data?.greeting}</span>
        </div>
      </div>
    </>
  );
}
