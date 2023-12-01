import { placeholderBlurhash } from "@/lib/utils";
import {
  Event,
  Organization,
  Role,
  TicketTier,
  User,
  UserRole,
} from "@prisma/client";
import Image from "next/image";
import { useMemo } from "react";
import {
  convertNameToTwoLetters,
  getTwoLetterPlaceholder,
  getUsername,
  shortenString
} from "@/lib/profile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import OpenModalButton from "@/components/open-modal-button";
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { columns } from "@/components/event-attendee-table/columns";
import DataTable from "@/components/event-attendee-table/data-table";
import Form from "@/components/form";
import AddAttendeesModal from "@/components/modal/add-attendees";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RegistrationCardItems } from "./registration-card-items";
import { ExternalLink } from "lucide-react";
import { updateEvent, getUsersWithTicketForEvent } from "@/lib/actions";
import prisma from "@/lib/prisma";


type RolesAndUsers = {
  user: User;
  role: Role;
} & UserRole;

export function HostUser({ user }: { user: User }) {
  return (
    <div className="flex items-center space-x-4">
      <Avatar>
        {user?.image ? <AvatarImage src={user.image} /> : null}
        <AvatarFallback>{getTwoLetterPlaceholder(user)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-md font-semibold leading-none">{user.name}</p>
        {/* <p className="text-muted-foreground text-sm">{getUsername(user)}</p> */}
      </div>
    </div>
  );
}

export function HostsCard({ hostUsers }: { hostUsers: RolesAndUsers[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hosts</CardTitle>
        {/* <CardDescription>
          Invite your team members to collaborate.
        </CardDescription> */}
      </CardHeader>
      <CardContent className="grid gap-6">
        {hostUsers.map((hostUser) => (
          <HostUser key={hostUser.id} user={hostUser.user} />
        ))}
      </CardContent>
    </Card>
  );
}

export function AboutCard({ event }: { event: Event }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{event.description}</p>
      </CardContent>
    </Card>
  );
}

export async function AttendeeTableCard({ event }: { event: Event }) {
  const ticketTiers = await prisma.ticketTier.findMany({
    where: {
      eventId: event.id,
    },
  });

  const data = await getUsersWithTicketForEvent(event.path);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendees</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          data={data}
          columns={columns}
        />
        <div className="flex justify-end mt-4">
          <OpenModalButton text="Add attendees">
            <AddAttendeesModal
              ticketTiers={ticketTiers}
              event={event}
            />
          </OpenModalButton>
        </div>
      </CardContent>
    </Card>
  )
}

type RegistrationCardProps = {
  ticketTiers: (TicketTier & { role: Role })[];
  event: Event & { organization: Organization };
};

const VITALIA_2024_EVENT = "clox3yiay0000smfnfdan6b1h";

export function RegistrationCard({
  ticketTiers,
  event,
}: RegistrationCardProps) {
  const TitleCopy = (() => {
    // TODO:// Remove hardcoded event id
    if (event.id === VITALIA_2024_EVENT) {
      return <Link href="https://lu.ma/vitalia" className="hover:underline">Register Externally↗</Link>;
    }

    return "Registration Options";
  })();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{TitleCopy}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ticketTiers.map((ticketTier) => (
          <RegistrationCardItems
            key={ticketTier.id}
            ticketTier={ticketTier}
            event={event}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export default function Event({
  event,
  rolesAndUsers,
  ticketTiers,
}: {
  event: Event & { organization: Organization };
  rolesAndUsers: RolesAndUsers[];
  ticketTiers: (TicketTier & { role: Role })[];
}) {
  const uniqueUsers = useMemo(
    () =>
      Array.from(
        new Map(
          rolesAndUsers.map((item) => [item.user.id, item.user]),
        ).values(),
      ),
    [rolesAndUsers],
  );
  const uniqueRoles = useMemo(
    () =>
      Array.from(
        new Map(
          rolesAndUsers.map((item) => [item.role.id, item.role]),
        ).values(),
      ),
    [rolesAndUsers],
  );

  const hostUsers = useMemo(
    () => rolesAndUsers.filter((ru) => ru.role.name === "Host"),
    [rolesAndUsers],
  );

  return (
    <div className="flex flex-col items-center">
      <div className="mx-auto flex w-full max-w-[960px] flex-col space-y-6">
        <Card className="w-full overflow-hidden">
          <div className="flex flex-col">
            <div className="w-full">
              <AspectRatio ratio={2 / 1}>
                {event.image ?
                  <Image
                    alt={event.name ?? "Event thumbnail"}
                    className="object-cover"
                    src={event.image ?? "/placeholder.png"}
                    layout={"fill"}
                    priority={true}
                    quality={80}
                    placeholder="blur"
                    blurDataURL={event.imageBlurhash ?? placeholderBlurhash}
                  /> :
                  <Form
                    // title="Preview Image"
                    // description="Accepted formats: .png, .jpg, .jpeg"
                    // helpText="Max file size 50MB. Recommended size 1200x600."
                    inputAttrs={{
                      name: "image",
                      type: "file",
                      defaultValue: event?.image!,
                    }}
                    handleSubmit={updateEvent}
                  />
                }
              </AspectRatio>
            </div>
            <div className="p-4 md:px-5 md:pb-4 md:pt-6">
              <h1 className="mt-2 text-2xl font-bold dark:text-white md:text-3xl">
                {event.name}
              </h1>
              <div className="mt-2 flex items-center space-x-3">
                {/* <Avatar className="h-5 w-5">
                  {event.organization?.logo ? (
                    <AvatarImage src={event.organization.logo} />
                  ) : null}
                </Avatar> */}
                <h3 className="font-medium uppercase">
                  {event.organization.name}
                </h3>
              </div>
            </div>
          </div>
        </Card>
        {ticketTiers && <RegistrationCard event={event} ticketTiers={ticketTiers} />}
        <AboutCard event={event} />
        <HostsCard hostUsers={hostUsers} />
        <AttendeeTableCard event={event} />
      </div>
    </div>
  );
}
