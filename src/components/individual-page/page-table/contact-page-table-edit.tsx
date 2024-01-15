import {
  Link,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { api } from "~/utils/api";
import { Button } from "../../ui/button";
import { Combobox } from "../../ui/combobox";
import { Input } from "../../ui/input";
import { Contact, ContactPolicy } from "@prisma/client";
import { EditContact } from "../edit-button/edit-contact";
import { useSession } from "next-auth/react";

export const ContactPageTableEdit: React.FC<{
  contact: Contact & { policy: ContactPolicy | undefined };
}> = ({ contact }) => {
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
      {((sessionData?.user.role.canEditAllContact ?? false) ||
        (contact.policy?.canEdit ?? false)) && (
        <>
          <EditContact contact={contact}>
            <div className="box-content cursor-pointer rounded-none border-r last:border-r-0 p-2 text-muted-foreground transition-colors hover:bg-accent">
              <Pencil className="h-4 w-4" />
            </div>
          </EditContact>
          <Popover open={linkOpen} onOpenChange={setLinkOpen}>
            <PopoverTrigger asChild>
              <div className="box-content border-r last:border-r-0 cursor-pointer p-2 text-muted-foreground transition-colors hover:bg-accent">
                <Link className="h-4 w-4" />
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
      {((sessionData?.user.role.canDeleteAllContact ?? false) ||
        (contact.policy?.canDelete ?? false)) && (
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
