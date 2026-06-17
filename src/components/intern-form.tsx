import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
      navigate(`/records/${saved.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save record");
    } finally {
      setSubmitting(false);
    }
  };

  const dur = durationMonths(form.startDate, form.endDate);

  return (
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
      {/* Candidate Information */}
      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-base sm:text-lg">Candidate Information</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0 grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
          {/* Full Name with suggestions */}
          <div className="md:col-span-2 relative">
            <Label htmlFor="fullName" className="text-xs sm:text-sm">Full Name *</Label>
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
              className="text-xs sm:text-sm"
            />
            {openSuggest && suggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover p-1 shadow-lg">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => pickSuggestion(s)}
                    className="w-full rounded-md px-2 py-1.5 text-left text-xs sm:text-sm hover:bg-accent"
                  >
                    <div className="font-medium truncate">{s.fullName}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground truncate">NIC: {s.nic}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Name with Initials */}
          <div>
            <Label htmlFor="nameInit" className="text-xs sm:text-sm">Name with Initials</Label>
            <Input
              id="nameInit"
              value={form.nameWithInitials}
              onChange={(e) => update("nameWithInitials", e.target.value)}
              placeholder="T.C. Maddumabandara"
              className="text-xs sm:text-sm"
            />
          </div>

          {/* NIC */}
          <div>
            <Label htmlFor="nic" className="text-xs sm:text-sm">NIC *</Label>
            <Input
              id="nic"
              value={form.nic}
              onChange={(e) => update("nic", e.target.value)}
              placeholder="200128801806"
              className="text-xs sm:text-sm"
            />
          </div>

          {/* Home Address */}
          <div className="md:col-span-2">
            <Label htmlFor="addr" className="text-xs sm:text-sm">Home Address *</Label>
            <Textarea
              id="addr"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              rows={2}
              placeholder="No. 140B, Suwasewa Mawatha, …"
              className="text-xs sm:text-sm"
            />
          </div>

          {/* Telephone */}
          <div>
            <Label htmlFor="phone" className="text-xs sm:text-sm">Telephone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="0716841036"
              className="text-xs sm:text-sm"
            />
          </div>

          {/* Department */}
          <div>
            <Label htmlFor="dept" className="text-xs sm:text-sm">Department *</Label>
            <Input
              id="dept"
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
              placeholder="Human Resource Department"
              className="text-xs sm:text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Internship Details */}
      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-base sm:text-lg">Internship Details</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {/* Start Date */}
          <div>
            <Label htmlFor="start" className="text-xs sm:text-sm">Start Date *</Label>
            <Input
              id="start"
              type="date"
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              className="text-xs sm:text-sm"
            />
          </div>

          {/* End Date */}
          <div>
            <Label htmlFor="end" className="text-xs sm:text-sm">End Date *</Label>
            <Input
              id="end"
              type="date"
              value={form.endDate}
              onChange={(e) => update("endDate", e.target.value)}
              className="text-xs sm:text-sm"
            />
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="duration" className="text-xs sm:text-sm">Duration</Label>
            <Input
              id="duration"
              value={form.duration || dur}
              onChange={(e) => update("duration", e.target.value)}
              placeholder={String(dur)}
              className="text-xs sm:text-sm"
            />
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Clear to auto-calculate.
            </p>
          </div>

          {/* Supervisor */}
          <div className="sm:col-span-2 md:col-span-3">
            <Label htmlFor="sup" className="text-xs sm:text-sm">Supervisor Name &amp; Designation *</Label>
            <Input
              id="sup"
              value={form.supervisor}
              onChange={(e) => update("supervisor", e.target.value)}
              placeholder="Wasantha Mudalige — Head of Human Resource Operation"
              className="text-xs sm:text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 flex-col-reverse sm:flex-row">
        <Button type="button" variant="outline" onClick={() => navigate("/records")} className="w-full sm:w-auto text-xs sm:text-sm">
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto text-xs sm:text-sm">
          {submitting ? "Saving…" : editingId ? "Update record" : "Save record"}
        </Button>
      </div>
    </form>
  );
}
