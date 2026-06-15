import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// suggestions are rendered inline; no Popover import required
import { saveIntern } from "@/lib/interns";
import type { InternRecord, InternInput } from "@/lib/types";
import { durationMonths } from "@/lib/format";

const empty: InternInput = {
  fullName: "",
  nameWithInitials: "",
  nic: "",
  address: "",
  department: "",
  startDate: "",
  endDate: "",
  supervisor: "",
  phone: "",
  duration: "",
};

const nicValid = (v: string) => /^\d{12}$/.test(v) || /^\d{9}[vVxX]$/.test(v);
const phoneValid = (v: string) => /^\d{10,15}$/.test(v.replace(/\D/g, ""));

export function InternForm({
  initial,
  existing,
}: {
  initial?: Partial<InternInput>;
  existing?: InternRecord[];
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState<InternInput>({ ...empty, ...initial });
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [openSuggest, setOpenSuggest] = useState(false);

  useEffect(() => {
    setForm({ ...empty, ...initial });
  }, [initial]);

  const suggestions = useMemo(() => {
    const q = form.fullName.trim().toLowerCase();
    if (!existing || q.length < 2) return [];
    return existing.filter((r) => r.fullName.toLowerCase().includes(q)).slice(0, 5);
  }, [form.fullName, existing]);

  const update = <K extends keyof InternInput>(k: K, v: InternInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const pickSuggestion = (r: InternRecord) => {
    setForm({
      fullName: r.fullName,
      nameWithInitials: r.nameWithInitials,
      nic: r.nic,
      address: r.address,
      department: r.department,
      startDate: r.startDate,
      endDate: r.endDate,
      duration: r.duration ?? "",
      supervisor: r.supervisor,
      phone: r.phone,
    });
    setEditingId(r.id);
    setOpenSuggest(false);
    toast.info(`Loaded existing record: ${r.fullName}`);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) return toast.error("Full Name is required");
    if (!form.address.trim()) return toast.error("Home Address is required");
    if (!form.department.trim()) return toast.error("Department is required");
    if (!nicValid(form.nic)) return toast.error("NIC must be 12 digits or 9 digits + V/X");
    if (!form.startDate || !form.endDate) return toast.error("Start and End dates are required");
    if (form.endDate <= form.startDate) return toast.error("End Date must be after Start Date");
    if (form.phone && !phoneValid(form.phone)) return toast.error("Telephone must be 10–15 digits");

    setSubmitting(true);
    try {
      const saved = await saveIntern(form, editingId);
      toast.success(editingId ? "Record updated" : "Record created");
      navigate({ to: "/records/$id", params: { id: saved.id } });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save record");
    } finally {
      setSubmitting(false);
    }
  };

  const dur = durationMonths(form.startDate, form.endDate);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Candidate Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 relative">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => {
                update("fullName", e.target.value);
                setOpenSuggest(true);
              }}
              onFocus={() => setOpenSuggest(true)}
              placeholder="e.g. Tashen Chamikara Maddumabandara"
              autoComplete="off"
            />
            {openSuggest && suggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover p-1 shadow-lg">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => pickSuggestion(s)}
                    className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                  >
                    <div className="font-medium">{s.fullName}</div>
                    <div className="text-xs text-muted-foreground">NIC: {s.nic}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="nameInit">Name with Initials</Label>
            <Input
              id="nameInit"
              value={form.nameWithInitials}
              onChange={(e) => update("nameWithInitials", e.target.value)}
              placeholder="T.C. Maddumabandara"
            />
          </div>
          <div>
            <Label htmlFor="nic">NIC *</Label>
            <Input
              id="nic"
              value={form.nic}
              onChange={(e) => update("nic", e.target.value)}
              placeholder="200128801806"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="addr">Home Address *</Label>
            <Textarea
              id="addr"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              rows={2}
              placeholder="No. 140B, Suwasewa Mawatha, …"
            />
          </div>

          <div>
            <Label htmlFor="phone">Telephone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="0716841036"
            />
          </div>
          <div>
            <Label htmlFor="dept">Department *</Label>
            <Input
              id="dept"
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
              placeholder="Human Resource Department"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Internship Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="start">Start Date *</Label>
            <Input
              id="start"
              type="date"
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="end">End Date *</Label>
            <Input
              id="end"
              type="date"
              value={form.endDate}
              onChange={(e) => update("endDate", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              value={form.duration || dur}
              onChange={(e) => update("duration", e.target.value)}
              placeholder={String(dur)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Clear to use auto-calculated duration.
            </p>
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="sup">Supervisor Name &amp; Designation *</Label>
            <Input
              id="sup"
              value={form.supervisor}
              onChange={(e) => update("supervisor", e.target.value)}
              placeholder="Wasantha Mudalige — Head of Human Resource Operation"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate({ to: "/records" })}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : editingId ? "Update record" : "Save record"}
        </Button>
      </div>
    </form>
  );
}
