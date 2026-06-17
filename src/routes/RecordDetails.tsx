import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { InternForm } from '@/components/intern-form'
import { getIntern, listInterns } from '@/lib/interns'
import { ArrowLeft, FileText, Download } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SignaturePad } from '@/components/signature-pad'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function RecordDetails() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()

  if (!id) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="p-10 text-center text-muted-foreground">
          Invalid record ID.
        </div>
      </div>
    )
  }

  const { data: intern, isLoading } = useQuery({
    queryKey: ['intern', id],
    queryFn: () => getIntern(id),
  })

  const { data: existing = [] } = useQuery({
    queryKey: ['interns'],
    queryFn: listInterns,
  })

  const handleSignatureSaved = () => {
    qc.invalidateQueries({ queryKey: ['intern', id] })
    qc.invalidateQueries({ queryKey: ['interns'] })
  }

  if (!intern && !isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="p-10 text-center text-muted-foreground">Record not found.</div>
      </div>
    )
  }

  const signatures = intern?.metadata?.signatures || {}
  const documents = intern?.metadata?.documents || []

  return (
    <div className="w-full min-h-screen">
      <div className="mx-auto max-w-5xl space-y-4 p-3 sm:p-4 md:p-6">
        <Link
          to="/records"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Edit Intern Record</h1>
          <p className="text-sm text-muted-foreground">
            Update master data and manage signatures & documents.
          </p>
        </div>

        {isLoading || !intern ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="signatures">Signatures</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <InternForm initial={intern} existing={existing} />
            </TabsContent>

            <TabsContent value="signatures" className="space-y-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {/* Intern Signature Pad */}
                <div className="space-y-2">
                  <SignaturePad internId={id} type="intern" onSave={handleSignatureSaved} />
                  {signatures.intern && (
                    <Card className="mt-2">
                      <CardHeader className="p-3 pb-0">
                        <CardTitle className="text-xs font-medium">
                          Intern Signature
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

                {/* Company Rep Signature Pad */}
                <div className="space-y-2">
                  <SignaturePad
                    internId={id}
                    type="company_rep"
                    onSave={handleSignatureSaved}
                  />
                  {signatures.company_rep && (
                    <Card className="mt-2">
                      <CardHeader className="p-3 pb-0">
                        <CardTitle className="text-xs font-medium">
                          Company Rep
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 flex justify-center bg-slate-50 rounded-b-lg border-t mt-2">
                        <img
                          src={signatures.company_rep}
                          alt="Company Rep Signature"
                          className="h-16 object-contain"
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Supervisor Signature Pad */}
                <div className="space-y-2">
                  <SignaturePad
                    internId={id}
                    type="supervisor"
                    onSave={handleSignatureSaved}
                  />
                  {signatures.supervisor && (
                    <Card className="mt-2">
                      <CardHeader className="p-3 pb-0">
                        <CardTitle className="text-xs font-medium">
                          Supervisor
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 flex justify-center bg-slate-50 rounded-b-lg border-t mt-2">
                        <img
                          src={signatures.supervisor}
                          alt="Supervisor Signature"
                          className="h-16 object-contain"
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Documents List */}
              {documents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Uploaded Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {documents.map((doc: any, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between text-xs py-2 border-b last:border-b-0 flex-wrap gap-2"
                        >
                          <span className="flex items-center gap-2">
                            <FileText className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{doc.fileName}</span>
                          </span>
                          <span className="text-muted-foreground whitespace-nowrap">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
