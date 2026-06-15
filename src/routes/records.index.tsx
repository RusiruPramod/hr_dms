import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, FileText, ShieldCheck, Plus, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteIntern, listInterns } from "@/lib/interns";
import type { InternRecord } from "@/lib/types";
import { getCurrentUser } from "@/hooks/use-auth";

export const Route = createFileRoute("/records/")({
  head: () => ({
    meta: [
      { title: "Intern Records — DocuFlow HR" },
      {
        name: "description",
        content: "Master data table of all interns (Book1). Search, edit, delete and export.",
      },
    ],
  }),
  beforeLoad: async () => {
    const user = getCurrentUser();
    if (!user) {
      throw redirect({ to: "/login" });
    }
  },
  component: RecordsPage,
});

type SortKey = "fullName" | "department" | "startDate" | "endDate" | "updatedAt";

function toCsv(rows: InternRecord[]): string {
  const headers = [
    "Full Name",
    "Name with Initials",
    "NIC",
    "Address",
    "Department",
    "Start Date",
    "End Date",
    "Supervisor",
    "Telephone",
  ];
  const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.fullName,
        r.nameWithInitials,
        r.nic,
        r.address,
        r.department,
        r.startDate,
        r.endDate,
        r.supervisor,
        r.phone,
      ]
        .map(esc)
        .join(","),
    );
  }
  return lines.join("\n");
}

function RecordsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["interns"],
    queryFn: listInterns,
  });

  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [delTarget, setDelTarget] = useState<InternRecord | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const out = term
      ? rows.filter((r) =>
          [r.fullName, r.nic, r.department, r.supervisor, r.phone].some((v) =>
            v?.toLowerCase().includes(term),
          ),
        )
      : rows;
    return [...out].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, q, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    await deleteIntern(delTarget.id);
    setDelTarget(null);
    qc.invalidateQueries({ queryKey: ["interns"] });
    toast.success("Record deleted");
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interns_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Intern Records</h1>
          <p className="text-sm text-muted-foreground">
            Master data (Book1) — {rows.length} record(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={() => navigate({ to: "/records/new" })}>
            <Plus className="mr-2 h-4 w-4" /> New Record
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, NIC, department…"
          className="pl-9"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => toggleSort("fullName")} className="cursor-pointer">
                  Full Name
                </TableHead>
                <TableHead>NIC</TableHead>
                <TableHead onClick={() => toggleSort("department")} className="cursor-pointer">
                  Department
                </TableHead>
                <TableHead onClick={() => toggleSort("startDate")} className="cursor-pointer">
                  Start
                </TableHead>
                <TableHead onClick={() => toggleSort("endDate")} className="cursor-pointer">
                  End
                </TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    {rows.length === 0 ? (
                      <>
                        No records yet.{" "}
                        <Link to="/records/new" className="text-primary underline">
                          Create one
                        </Link>
                        .
                      </>
                    ) : (
                      "No matches."
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{r.fullName}</TableCell>
                    <TableCell className="font-mono text-xs">{r.nic}</TableCell>
                    <TableCell>{r.department}</TableCell>
                    <TableCell>{r.startDate}</TableCell>
                    <TableCell>{r.endDate}</TableCell>
                    <TableCell>{r.phone}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" asChild title="Offer Letter">
                          <Link to="/offer-letter" search={{ id: r.id }}>
                            <FileText className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="icon" variant="ghost" asChild title="NDA">
                          <Link to="/nda" search={{ id: r.id }}>
                            <ShieldCheck className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="icon" variant="ghost" asChild title="Edit">
                          <Link to="/records/$id" params={{ id: r.id }}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDelTarget(r)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog open={!!delTarget} onOpenChange={(o) => !o && setDelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{delTarget?.fullName}</strong> from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
