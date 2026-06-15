import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { InternForm } from "@/components/intern-form";
import { getIntern, listInterns } from "@/lib/interns";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/hooks/use-auth";

export const Route = createFileRoute("/records/$id")({
  head: () => ({
    meta: [
      { title: "Edit Intern Record — DocuFlow HR" },
      { name: "description", content: "Edit an existing intern master record." },
    ],
  }),
  beforeLoad: async () => {
    const user = getCurrentUser();
    if (!user) {
      throw redirect({ to: "/login" });
    }
  },
  component: EditRecord,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Record not found.</div>
  ),
});

function EditRecord() {
  const { id } = Route.useParams();
  const { data: intern, isLoading } = useQuery({
    queryKey: ["intern", id],
    queryFn: async () => {
      const r = await getIntern(id);
      if (!r) throw notFound();
      return r;
    },
  });
  const { data: existing = [] } = useQuery({
    queryKey: ["interns"],
    queryFn: listInterns,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <Link to="/records" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to records
      </Link>
      <div>
        <h1 className="text-2xl font-semibold">Edit Intern Record</h1>
        <p className="text-sm text-muted-foreground">Update master data for this candidate.</p>
      </div>
      {isLoading || !intern ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <InternForm initial={intern} existing={existing} />
      )}
    </div>
  );
}
