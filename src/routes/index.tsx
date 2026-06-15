import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, FileText, ShieldCheck, UserPlus } from "lucide-react";
import { listInterns } from "@/lib/interns";
import { firebaseEnabled } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — DocuFlow HR" },
      {
        name: "description",
        content: "Internship document automation dashboard for Ceylon Cold Stores PLC.",
      },
    ],
  }),
  beforeLoad: async () => {
    const user = getCurrentUser();
    if (!user) {
      throw redirect({ to: "/login" });
    }
  },
  component: Dashboard,
});

function Dashboard() {
  const { data: interns = [], isLoading } = useQuery({
    queryKey: ["interns"],
    queryFn: listInterns,
  });

  const active = interns.filter((r) => {
    const now = new Date().toISOString().slice(0, 10);
    return r.startDate <= now && r.endDate >= now;
  }).length;

  const stats = [
    { label: "Total Interns", value: interns.length, icon: Users, to: "/records" },
    { label: "Active Now", value: active, icon: UserPlus, to: "/records" },
    { label: "Offer Letters", value: interns.length, icon: FileText, to: "/offer-letter" },
    { label: "NDA Documents", value: interns.length, icon: ShieldCheck, to: "/nda" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage intern master records and generate offer letters &amp; NDA agreements.
          </p>
        </div>
        <Badge variant={firebaseEnabled ? "default" : "secondary"}>
          {firebaseEnabled ? "Firebase synced" : "Local storage"}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to}>
            <Card className="transition-shadow hover:shadow-elegant">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-3xl font-semibold">{isLoading ? "…" : s.value}</p>
                </div>
                <div className="rounded-xl bg-accent p-3 text-accent-foreground">
                  <s.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : interns.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No intern records yet.{" "}
                <Link to="/records/new" className="text-primary underline">
                  Create the first record
                </Link>
                .
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {interns.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{r.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.department} · {r.startDate} → {r.endDate}
                    </p>
                  </div>
                  <Link
                    to="/records/$id"
                    params={{ id: r.id }}
                    className="text-xs text-primary hover:underline"
                  >
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
