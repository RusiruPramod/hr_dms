import { useQuery } from '@tanstack/react-query'
import { useMemo, useRef, useState, useEffect } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Download, Printer, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSearchParams } from 'react-router-dom'
import { listInterns } from '@/lib/interns'
import { OfferLetterDocument } from '@/components/offer-letter-document'
import { exportElementToPdf, generatePdfBase64 } from '@/lib/pdf'

export default function OfferLetter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const id = searchParams.get('id') || undefined

  const { data: interns = [] } = useQuery({
    queryKey: ['interns'],
    queryFn: listInterns,
  })

  const [selectedId, setSelectedId] = useState<string | undefined>(id)
  const [offerDate, setOfferDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  )
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (id && id !== selectedId) setSelectedId(id)
  }, [id, selectedId])

  const intern = useMemo(
    () => interns.find((r) => r.id === selectedId) ?? null,
    [interns, selectedId],
  )

  const onSelect = (val: string) => {
    setSelectedId(val)
    setSearchParams({ id: val })
  }

  const onExport = async () => {
    if (!previewRef.current || !intern) return toast.error('Select an intern first')
    const filename = `OfferLetter_${intern.fullName.replace(/\s+/g, '_')}_${offerDate}.pdf`
    try {
      await exportElementToPdf(previewRef.current, filename)
      toast.success('PDF downloaded locally')
    } catch (err) {
      console.error(err)
      toast.error('Failed to export PDF')
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Offer Letter</h1>
        <p className="text-sm text-muted-foreground">
          Generate and export internship offer letters.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" /> Offer Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Intern (Candidate)</Label>
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
              <Label htmlFor="odate">Offer Date</Label>
              <Input
                id="odate"
                type="date"
                value={offerDate}
                onChange={(e) => setOfferDate(e.target.value)}
              />
            </div>

            {intern && (
              <div className="rounded-md border border-border bg-muted/40 p-3 text-xs space-y-1">
                <p>
                  <strong>Intern:</strong> {intern.fullName}
                </p>
                <p>
                  <strong>NIC:</strong> {intern.nic}
                </p>
                <p>
                  <strong>Department:</strong> {intern.department}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={onExport} disabled={!intern} size="sm" className="flex-1">
                <Download className="mr-2 h-4 w-4" /> Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {intern ? (
          <div className="border rounded-lg p-6 bg-white shadow-sm max-h-[80vh] overflow-y-auto">
            <div ref={previewRef}>
              <OfferLetterDocument intern={intern} offerDate={offerDate} />
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-12 bg-muted/30 flex items-center justify-center">
            <p className="text-muted-foreground">Select an intern to preview offer letter</p>
          </div>
        )}
      </div>
    </div>
  )
}
