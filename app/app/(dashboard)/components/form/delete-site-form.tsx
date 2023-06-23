"use client";

import LoadingDots from "@/components/app/loading-dots";
import clsx from "clsx";
import { useParams, useRouter } from "next/navigation";
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { toast } from "sonner";
import { deleteSite } from "./actions";

export default function DeleteSiteForm({ siteName }: { siteName: string }) {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  return (
    <form
      action={async (data: FormData) =>
        window.confirm("Are you sure you want to delete your site?") &&
        deleteSite(data, id, "delete")
          .then(async () => {
            router.push("/sites");
            toast.success(`Successfully deleted site!`);
          })
          .catch((err: Error) => toast.error(err.message))
      }
      className="rounded-lg border border-red-600 bg-white"
    >
      <div className="relative flex flex-col space-y-4 p-5 sm:p-10">
        <h2 className="text-xl font-cal">Delete Site</h2>
        <p className="text-sm text-stone-500">
          Deletes your site and all posts associated with it. Type in the name
          of your site <b>{siteName}</b> to confirm.
        </p>

        <input
          name="confirm"
          type="text"
          required
          pattern={siteName}
          placeholder={siteName}
          className="w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500"
        />
      </div>

      <div className="flex items-center justify-between rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 sm:px-10">
        <p className="text-sm text-stone-500">
          This action is irreversible. Please proceed with caution.
        </p>
        <div className="w-32">
          <FormButton />
        </div>
      </div>
    </form>
  );
}

function FormButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className={clsx(
        "flex h-10 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none",
        pending
          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
          : "border-red-600 bg-red-600 text-white hover:bg-white hover:text-red-600"
      )}
      disabled={pending}
    >
      {pending ? <LoadingDots color="#808080" /> : <p>Confirm Delete</p>}
    </button>
  );
}
