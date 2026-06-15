import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InternForm } from "@/components/intern-form";
import { getIntern, listInterns } from "@/lib/interns";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { getCurrentUser } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignaturePad } from "@/components/signature-pad";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  const qc = useQueryClient();
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

  const handleSignatureSaved = () => {
    qc.invalidateQueries({ queryKey: ["intern", id] });
    qc.invalidateQueries({ queryKey: ["interns"] });
  };

  const signatures = intern?.metadata?.signatures || {};
  const documents = intern?.metadata?.documents || [];

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6">
      <Link
        to="/records"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to records
      </Link>
      <div>
        <h1 className="text-2xl font-semibold">Edit Intern Record</h1>
        <p className="text-sm text-muted-foreground">
          Update master data and manage signatures & documents.
        </p>
      </div>

      {isLoading || !intern ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-4">
            <TabsTrigger value="details">Candidate Details</TabsTrigger>
            <TabsTrigger value="signatures">Signatures & Docs</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <InternForm initial={intern} existing={existing} />
          </TabsContent>

          <TabsContent value="signatures" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Intern Signature Pad */}
              <div className="space-y-2">
                <SignaturePad internId={id} type="intern" onSave={handleSignatureSaved} />
                {signatures.intern && (
                  <Card className="mt-2">
                    <CardHeader className="p-3 pb-0">
                      <CardTitle className="text-xs font-medium">
                        Intern Signature Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 flex justify-center bg-slate-50 rounded-b-lg border-t mt-2">
                      <img
                        src={signatures.intern}
                        alt="Intern Signature"
                        className="h-16 object-contain"
                      />
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Witness Signature Pad */}
              <div className="space-y-2">
                <SignaturePad internId={id} type="witness" onSave={handleSignatureSaved} />
                {signatures.witness && (
                  <Card className="mt-2">
                    <CardHeader className="p-3 pb-0">
                      <CardTitle className="text-xs font-medium">
                        Witness Signature Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 flex justify-center bg-slate-50 rounded-b-lg border-t mt-2">
                      <img
                        src={signatures.witness}
                        alt="Witness Signature"
                        className="h-16 object-contain"
                      />
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* HR Signature Pad */}
              <div className="space-y-2">
                <SignaturePad internId={id} type="hr" onSave={handleSignatureSaved} />
                {signatures.hr && (
                  <Card className="mt-2">
                    <CardHeader className="p-3 pb-0">
                      <CardTitle className="text-xs font-medium">HR Signature Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 flex justify-center bg-slate-50 rounded-b-lg border-t mt-2">
                      <img src={signatures.hr} alt="HR Signature" className="h-16 object-contain" />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Generated Documents History
                </CardTitle>
                <CardDescription>
                  View and download previously generated PDF agreements for this candidate.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-lg">
                    No documents generated yet. Head over to the Offer Letter or NDA pages to
                    generate them.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-border pb-2">
                          <th className="font-semibold py-2">Document</th>
                          <th className="font-semibold py-2">File Name</th>
                          <th className="font-semibold py-2">Generated At</th>
                          <th className="font-semibold py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((docObj: any) => (
                          <tr
                            key={docObj.id}
                            className="border-b border-border hover:bg-muted/40 transition-colors"
                          >
                            <td className="py-3">
                              <Badge
                                variant={docObj.type === "offer" ? "default" : "secondary"}
                                className="capitalize"
                              >
                                {docObj.type === "offer" ? "Offer Letter" : "NDA"}
                              </Badge>
                            </td>
                            <td className="py-3 font-mono text-xs">{docObj.fileName}</td>
                            <td className="py-3 text-muted-foreground">
                              {new Date(docObj.generatedAt).toLocaleString()}
                            </td>
                            <td className="py-3 text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <a
                                  href={docObj.storageUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                >
                                  <Download className="mr-1 h-4 w-4" /> Download
                                </a>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
