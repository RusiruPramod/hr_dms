import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { InternForm } from "@/components/intern-form";
import { listInterns } from "@/lib/interns";
import { getCurrentUser } from "@/hooks/use-auth";

export const Route = createFileRoute("/records/new")({
  head: () => ({
    meta: [
      { title: "New Intern Record — DocuFlow HR" },
      { name: "description", content: "Create a new intern master record." },
    ],
  }),
  beforeLoad: async () => {
    const user = getCurrentUser();
    if (!user) {
      throw redirect({ to: "/login" });
    }
  },
  component: NewRecord,
});

function NewRecord() {
  const { data: existing = [] } = useQuery({
    queryKey: ["interns"],
    queryFn: listInterns,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">New Intern Record</h1>
        <p className="text-sm text-muted-foreground">
          Type a name to auto-fill if the candidate already exists.
        </p>
      </div>
      <InternForm existing={existing} />
    </div>
  );
}
