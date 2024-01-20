import Head from "next/head";
import { Breadcrumbs } from "~/components/breadcrumbs";
import { AddContact } from "~/components/create/create-contact";
import { Layout } from "~/components/layout";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { Briefcase, LinkIcon, Mail, Voicemail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "~/utils/cn";
import initials from "initials";
import {
  Loader2,
  MoveHorizontal,
  MoveLeft,
  MoveRight,
  Pencil,
  Trash,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import type { Contact, ContactPolicy } from "@prisma/client";
import { CanDoOperation } from "~/utils/policyQuery";
import { EditContact } from "~/components/edit-button/edit-contact";

export default function Contacts() {
  const { data: session } = useSession();
  return (
    <>
      <Head>
        <title>CRM / Contacts</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex flex-grow flex-col overflow-y-scroll p-5">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold">Contacts</h1>
              <span className="text-sm text-muted-foreground">
                View all of your contacts.
              </span>
            </div>
            {CanDoOperation({
              session,
              entity: "contact",
              operation: "create",
            }) && <AddContact />}
          </div>
          <Breadcrumbs />
          <ContactPageTable />
        </div>
      </Layout>
    </>
  );
}

const ContactPageTable = () => {
  const { data: contacts } = api.contact.getAll.useQuery({
    include: {
      user: true,
      companies: true,
      policies: true,
    },
  });
  const { data: session } = useSession();

  return (
    <>
      <div className="mt-3 flex flex-col rounded-md border">
        {!contacts && (
          <>
            <div className="flex items-center gap-2 border-b px-4 py-4 sm:px-6">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 flex-grow rounded-md" />
            </div>
            <div className="flex items-center gap-2 px-4 py-4 sm:px-6">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 flex-grow rounded-md" />
            </div>
          </>
        )}
        {!!contacts && !contacts.length && (
          <>
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              No contacts
            </div>
          </>
        )}
        {contacts?.map((contact) => {
          return (
            <Link
              passHref
              href={`/contacts/${contact.id}`}
              key={contact.id}
              className={cn(
                "group relative flex justify-between border-b transition-colors first:rounded-t-md last:rounded-b-md last:border-none hover:bg-muted/50"
              )}
            >
              <div className="flex shrink gap-2 px-4 py-4 hover:cursor-pointer sm:px-6">
                <Avatar className="h-8 w-8 text-xs">
                  <AvatarImage
                    src={contact.image ?? contact.user?.image ?? ""}
                    alt=""
                  />
                  <AvatarFallback>
                    {initials(contact.name).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <div className="flex h-8 items-center gap-2 text-base">
                    <span className="truncate font-semibold">
                      {contact.name}
                    </span>
                    {/* {!!contact.companies?.length && (
                      <>
                        <Badge
                          className="gap-0 truncate text-xs"
                          variant={"outline"}
                        >
                          <div>
                            <Briefcase className="mr-1 h-3 w-3" />
                          </div>
                          {contact.companies.map((company, index) => (
                            <>
                              <Link
                                key={company.id}
                                href={`/companies/${company.id}`}
                                className={cn(
                                  "cursor-pointer leading-3 hover:underline",
                                  {
                                    "ml-1": index > 0,
                                  }
                                )}
                              >
                                {company.name}
                              </Link>
                              <span className="leading-3">
                                {index + 1 < contact.companies.length && ", "}
                              </span>
                            </>
                          ))}
                        </Badge>
                      </>
                    )} */}
                    <div className="flex gap-1">
                      {!!contact.user &&
                        contact.user.id == session?.user.id && (
                          <Badge variant={"default"}>You</Badge>
                        )}
                      {!!contact.user && (
                        <Badge
                          variant={"outline"}
                          className="text-emphasis inline-flex items-center justify-center gap-x-1 rounded px-1.5 py-1 text-xs font-medium leading-3"
                        >
                          Internal
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="mb-1 text-sm empty:hidden">
                    {contact.info}
                  </span>
                  {(!!contact.user ||
                    !!contact.email ||
                    !!contact.mobile ||
                    !!contact.companies.length) && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {!!contact.companies &&
                        contact.companies.map((company) => {
                          return (
                            <>
                              <div className="flex items-center gap-1">
                                <Link href={`/companies/${company.id}`}>
                                  <Badge
                                    className="truncate hover:underline"
                                    variant={"secondary"}
                                  >
                                    <Briefcase className="mr-1 h-3 w-3" />
                                    {company.name}
                                  </Badge>
                                </Link>
                              </div>
                            </>
                          );
                        })}
                      {(!!contact.email || !!contact.user?.email) && (
                        <div className="flex items-center gap-1">
                          <div
                          // href={`mailto:${
                          //   contact.email ?? contact.user?.email
                          // }`}
                          >
                            <Badge variant={"secondary"}>
                              <Mail className="mr-1 h-3 w-3" />
                              {!!contact.email && contact.email}
                              {!contact.email && contact.user?.email}
                            </Badge>
                          </div>
                        </div>
                      )}
                      {!!contact.mobile && (
                        <div className="flex items-center gap-1">
                          <Badge variant={"secondary"}>
                            <Voicemail className="mr-1 h-3 w-3" />
                            {contact.mobile}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <ContactPageTableEdit contact={contact} />
            </Link>
          );
        })}
      </div>
    </>
  );
};

const ContactPageTableEdit = ({
  contact,
}: {
  contact: Contact & { policies: ContactPolicy[] };
}) => {
  const { data: sessionData } = useSession();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [linkLoading, setLinkLoading] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkIndex, setLinkIndex] = useState(0);
  const [linkValue, setLinkValue] = useState<string | undefined>(undefined);

  const { data: contactData } = api.contact.getAll.useQuery();

  const ctx = api.useUtils();

  const { mutate: deleteContact } = api.contact.delete.useMutation({
    onMutate: () => {
      setDeleteLoading(true);
    },
    onSuccess: async () => {
      await ctx.contact.getAll.invalidate();
      setLinkLoading(false);
    },
    onError: () => {
      setLinkLoading(false);
    },
  });

  const { mutate: linkContact } = api.contact.addLink.useMutation({
    onMutate: () => {
      setLinkLoading(true);
    },
    onSuccess: () => {
      setLinkValue(undefined);
      setLinkIndex(0);
      setLinkOpen(false);
      setLinkLoading(false);
      // void ctx.contact.getAll.invalidate();
    },
    onError: (error) => {
      console.log(error);
      setLinkLoading(false);
    },
  });

  return (
    <div
      key={`cpte-${contact.id}`}
      className="flex items-center justify-center mx-4 my-auto sm:mx-6 shrink-0 border rounded-md overflow-hidden empty:hidden"
      onClick={(event) => {
        event.preventDefault();
      }}
    >
      {CanDoOperation({
        session: sessionData,
        policies: contact.policies,
        entity: "contact",
        operation: "edit",
      }) && (
        <>
          <EditContact contact={contact}>
            <div className="box-content cursor-pointer rounded-none border-r last:border-r-0 p-2 text-muted-foreground transition-colors hover:bg-accent">
              <Pencil className="h-4 w-4" />
            </div>
          </EditContact>
          <Popover open={linkOpen} onOpenChange={setLinkOpen}>
            <PopoverTrigger asChild>
              <div className="box-content border-r last:border-r-0 cursor-pointer p-2 text-muted-foreground transition-colors hover:bg-accent">
                <LinkIcon className="h-4 w-4" />
              </div>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="flex w-[450px] flex-col space-y-3"
            >
              <div className="flex flex-col">
                <span className="text-lg font-semibold">Link contacts</span>
                <span className="text-sm text-muted-foreground">
                  Link two contacts together, one-directional linking is also
                  possible
                </span>
              </div>
              <div className="grid grid-cols-[1fr_40px_1fr] items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>Contact</span>
                <span></span>
                <span>Contact</span>
              </div>
              <div className="grid grid-cols-[1fr_40px_1fr] items-center justify-between gap-3">
                <Input
                  value={contact.name}
                  readOnly
                  disabled
                  className="!cursor-default"
                />
                <Button
                  size={"icon"}
                  variant={"outline"}
                  className="shrink-0"
                  onClick={() => {
                    setLinkIndex((prev) => {
                      return (prev + 1) % 3;
                    });
                  }}
                >
                  {
                    [
                      <MoveHorizontal className="h-5 w-5" />,
                      <MoveRight className="h-5 w-5" />,
                      <MoveLeft className="h-5 w-5" />,
                    ][linkIndex]
                  }
                </Button>
                <Combobox
                  options={
                    contactData
                      ?.filter((entry) => entry.id != contact.id)
                      .map((entry) => {
                        return { value: entry.id, label: entry.name };
                      }) ?? []
                  }
                  value={linkValue}
                  setValue={(value) => {
                    setLinkValue(value);
                  }}
                  placeholder="Select contact..."
                  className="w-auto flex-1 shrink truncate"
                />
              </div>
              <Button
                disabled={linkLoading}
                onClick={() => {
                  linkContact({
                    mode: linkIndex,
                    contactOne: contact.id,
                    contactTwo: linkValue!,
                  });
                }}
              >
                {linkLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add
              </Button>
            </PopoverContent>
          </Popover>
        </>
      )}
      {CanDoOperation({
        session: sessionData,
        policies: contact.policies,
        entity: "contact",
        operation: "delete",
      }) && (
        <div
          className="box-content border-r last:border-r-0 h-4 w-4 cursor-pointer p-2 text-red-500 transition-colors hover:bg-accent"
          onClick={() => {
            !deleteLoading && deleteContact({ id: contact.id });
          }}
        >
          {!deleteLoading ? (
            <Trash className="h-4 w-4" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </div>
      )}
    </div>
  );
};
