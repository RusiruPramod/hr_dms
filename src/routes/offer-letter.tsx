import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Download, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listInterns } from "@/lib/interns";
import { OfferLetterDocument } from "@/components/offer-letter-document";
import { exportElementToPdf, generatePdfBase64 } from "@/lib/pdf";
import { getCurrentUser } from "@/hooks/use-auth";

const search = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/offer-letter")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "Offer Letter — DocuFlow HR" },
      { name: "description", content: "Generate, preview and export internship Offer Letters." },
    ],
  }),
  beforeLoad: async () => {
    const user = getCurrentUser();
    if (!user) {
      throw redirect({ to: "/login" });
    }
  },
  component: OfferLetterPage,
});

function OfferLetterPage() {
  const { id } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: interns = [] } = useQuery({ queryKey: ["interns"], queryFn: listInterns });

  const [selectedId, setSelectedId] = useState<string | undefined>(id);
  const [letterDate, setLetterDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id && id !== selectedId) setSelectedId(id);
  }, [id, selectedId]);

  const intern = useMemo(
    () => interns.find((r) => r.id === selectedId) ?? null,
    [interns, selectedId],
  );

  const onSelect = (val: string) => {
    setSelectedId(val);
    navigate({ search: { id: val }, replace: true });
  };

  const onExport = async () => {
    if (!previewRef.current || !intern) return toast.error("Select an intern first");
    const filename = `OfferLetter_${intern.fullName.replace(/\s+/g, "_")}.pdf`;
    try {
      await exportElementToPdf(previewRef.current, filename);
      toast.success("PDF downloaded locally");

      // Upload to server in background
      toast.promise(
        (async () => {
          const base64 = await generatePdfBase64(previewRef.current!);
          const { uploadDocumentServer } = await import("@/lib/api/interns.functions");
          await uploadDocumentServer({
            data: {
              internId: intern.id,
              type: "offer",
              documentBase64: base64,
              fileName: filename,
            },
          });
        })(),
        {
          loading: "Saving copy to candidate's history...",
          success: "Saved to cloud history",
          error: "Failed to save to history",
        },
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PDF");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Offer Letter</h1>
          <p className="text-sm text-muted-foreground">
            Live preview updates as you change data. Export or print when ready.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" /> Letter Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Intern</Label>
              <Select value={selectedId} onValueChange={onSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an intern…" />
                </SelectTrigger>
                <SelectContent>
                  {interns.length === 0 ? (
                    <div className="p-2 text-xs text-muted-foreground">
                      No records — create one first.
                    </div>
                  ) : (
                    interns.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.fullName} · {r.nic}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ldate">Letter Date</Label>
              <Input
                id="ldate"
                type="date"
                value={letterDate}
                onChange={(e) => setLetterDate(e.target.value)}
              />
            </div>

            {intern && (
              <div className="rounded-md border border-border bg-muted/40 p-3 text-xs space-y-1">
                <p>
                  <strong>Address:</strong> {intern.address}
                </p>
                <p>
                  <strong>Dept:</strong> {intern.department}
                </p>
                <p>
                  <strong>Period:</strong> {intern.startDate} → {intern.endDate}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={onExport} disabled={!intern} className="flex-1">
                <Download className="mr-2 h-4 w-4" /> PDF
              </Button>
              <Button onClick={() => window.print()} variant="outline" disabled={!intern}>
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="overflow-auto rounded-lg bg-muted/40 p-4">
          <div ref={previewRef}>
            <OfferLetterDocument intern={intern} letterDate={letterDate} />
          </div>
        </div>
      </div>
    </div>
  );
}
