import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { Briefcase, Building2, Mail, Voicemail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import { ContactPageTableEdit } from "./contact-page-table-edit";
import { Skeleton } from "./ui/skeleton";
import { cn } from "~/utils/cn";
import { buttonVariants } from "./ui/button";

export const ContactPageTable = () => {
  const { data: contactData } = api.contact.getAll.useQuery();
  const { data: sessionData } = useSession();

  return (
    <>
      <div className="mt-3 flex flex-col rounded-md border">
        {!contactData && (
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
        {!!contactData && !contactData.length && (
          <>
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              No contacts
            </div>
          </>
        )}
        {contactData?.map((contact) => {
          return (
            <Link
              passHref={true}
              href={`/contacts/${contact.id}`}
              key={contact.id}
              className={cn(
                "group relative flex justify-between border-b transition-colors first:rounded-t-md last:rounded-b-md last:border-none hover:bg-muted/50",
              )}
            >
              <div className="flex shrink gap-2 px-4 py-4 hover:cursor-pointer sm:px-6">
                <Avatar className="h-8 w-8 border group-hover:text-sm">
                  <AvatarImage
                    src={contact.image ?? contact.user?.image ?? ""}
                    alt=""
                  />
                  <AvatarFallback className="text-xs">
                    {contact.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <div className="flex h-8 items-center gap-2 text-sm">
                    <span className="truncate font-semibold">
                      {contact.name}
                    </span>
                    {!!contact.companies?.length && (
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
                                href={`/companies/${company.companyId}`}
                                className={cn(
                                  "cursor-pointer leading-3 hover:underline",
                                  {
                                    "ml-1": index > 0,
                                  },
                                )}
                              >
                                {company.company.name}
                              </Link>
                              {index + 1 < contact.companies.length && ", "}
                            </>
                          ))}
                        </Badge>
                      </>
                    )}
                    <div className="flex gap-1">
                      {!!contact.user &&
                        contact.user.id == sessionData?.user.id && (
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
                  {!!contact.info && (
                    <span className="mb-1 text-sm">{contact.info}</span>
                  )}
                  {(!!contact.user || !!contact.email || !!contact.mobile) && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {(!!contact.email || !!contact.user?.email) && (
                        <div className="flex items-center gap-1">
                          <div
                          // href={`mailto:${
                          //   contact.email ?? contact.user?.email
                          // }`}
                          >
                            <Badge
                              variant={"outline"}
                              className="text-emphasis inline-flex items-center justify-center gap-x-1 truncate rounded  px-1.5 py-1 text-xs font-medium leading-3"
                            >
                              <Mail className="mr-1 h-3 w-3" />
                              {!!contact.email && contact.email}
                              {!contact.email && contact.user?.email}
                            </Badge>
                          </div>
                        </div>
                      )}
                      {/* {!!contact.companies &&
                        contact.companies.map((company) => {
                          return (
                            <>
                              <div className="flex items-center gap-1">
                                <Link
                                  href={`/companies/${company.company?.id}`}
                                >
                                  <Badge
                                    className="truncate hover:underline"
                                    variant={"outline"}
                                  >
                                    <Briefcase className="mr-1 h-3 w-3" />
                                    {company.company?.name}
                                  </Badge>
                                </Link>
                              </div>
                            </>
                          );
                        })} */}
                      {!!contact.mobile && (
                        <div className="flex items-center gap-1">
                          <Badge
                            variant={"outline"}
                            className="text-emphasis inline-flex items-center justify-center gap-x-1 truncate rounded px-1.5 py-1 text-xs font-medium leading-3"
                          >
                            <Voicemail className="mr-1 h-3 w-3" />
                            {contact.mobile}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <ContactPageTableEdit contactId={contact.id} />
            </Link>
          );
        })}
      </div>
    </>
  );
};
