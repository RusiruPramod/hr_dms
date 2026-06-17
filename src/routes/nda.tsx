import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Download, Printer, ShieldCheck } from "lucide-react";
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
import { NdaDocument } from "@/components/nda-document";
import { exportElementToPdf, generatePdfBase64 } from "@/lib/pdf";

function NdaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id") || undefined;
  const { data: interns = [] } = useQuery({ queryKey: ["interns"], queryFn: listInterns });

  const [selectedId, setSelectedId] = useState<string | undefined>(id ?? undefined);
  const [agreementDate, setAgreementDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
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
    setSearchParams({ id: val });
  };

  const onExport = async () => {
    if (!previewRef.current || !intern) return toast.error("Select an intern first");
    const filename = `NDA_${intern.fullName.replace(/\s+/g, "_")}_${agreementDate}.pdf`;
    try {
      await exportElementToPdf(previewRef.current, filename);
      toast.success("PDF downloaded locally");

      // Upload to server in background
      toast.promise(
        (async () => {
          const base64 = await generatePdfBase64(previewRef.current!);
          const { uploadDocumentServer } = await import("@/lib/api/interns.functions");
          await uploadDocumentServer(
            intern.id,
            "nda",
            base64,
            filename,
          );
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
    <div className="w-full min-h-screen">
      <div className="mx-auto max-w-7xl space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">NDA Agreement</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            First Party details auto-populate from the selected intern.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[340px_1fr]">
          {/* Config Card */}
          <Card className="h-fit">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <ShieldCheck className="h-4 w-4 flex-shrink-0" /> Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0 space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Intern (First Party)</Label>
                <Select value={selectedId} onValueChange={onSelect}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="Select an intern…" />
                  </SelectTrigger>
                  <SelectContent>
                    {interns.length === 0 ? (
                      <div className="p-2 text-xs text-muted-foreground">
                        No records — create one first.
                      </div>
                    ) : (
                      interns.map((r) => (
                        <SelectItem key={r.id} value={r.id} className="text-xs sm:text-sm">
                          {r.fullName} · {r.nic}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="adate" className="text-xs sm:text-sm">Agreement Date</Label>
                <Input
                  id="adate"
                  type="date"
                  value={agreementDate}
                  onChange={(e) => setAgreementDate(e.target.value)}
                  className="text-xs sm:text-sm"
                />
              </div>

              {intern && (
                <div className="rounded-md border border-border bg-muted/40 p-2 sm:p-3 text-[10px] sm:text-xs space-y-1">
                  <p>
                    <strong>NIC:</strong> {intern.nic}
                  </p>
                  <p>
                    <strong>Address:</strong> {intern.address}
                  </p>
                  <p>
                    <strong>Dept:</strong> {intern.department}
                  </p>
                </div>
              )}

              <div className="rounded-md border border-border bg-accent/40 p-2 sm:p-3 text-[10px] sm:text-xs space-y-1">
                <p className="font-semibold">Second Party (fixed)</p>
                <p>Ceylon Cold Stores PLC</p>
                <p>Authorized: Wasantha Mudalige — Head of HR</p>
                <p>Witness: Kamal Hasan — Asst. Manager HR</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={onExport} disabled={!intern} className="flex-1 text-xs sm:text-sm">
                  <Download className="mr-2 h-3 sm:h-4 w-3 sm:w-4" /> PDF
                </Button>
                <Button onClick={() => window.print()} variant="outline" disabled={!intern} className="text-xs sm:text-sm px-2 sm:px-3">
                  <Printer className="h-3 sm:h-4 w-3 sm:w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Area */}
          <div className="overflow-auto rounded-lg bg-muted/40 p-3 sm:p-4 max-h-[70vh] sm:max-h-[80vh]">
            <div ref={previewRef} className="print:m-0">
              <NdaDocument intern={intern} agreementDate={agreementDate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NdaPage;
