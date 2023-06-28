import { ReactNode } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import SiteSettingsNav from "./nav";

export default async function SiteAnalyticsLayout({
  params,
  children,
}: {
  params: { id: string };
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  const data = await prisma.site.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!data || data.userId !== session.user.id) {
    notFound();
  }

  const url = `${data.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  return (
    <>
      <div className="flex items-center space-x-4">
        <h1 className="font-cal text-3xl font-bold">
          Settings for {data.name}
        </h1>
        <a
          href={`https://${url}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium px-2 py-1 rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors truncate"
        >
          {url} ↗
        </a>
      </div>
      <SiteSettingsNav />
      {children}
    </>
  );
}
