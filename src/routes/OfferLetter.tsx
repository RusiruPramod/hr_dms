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
    <div className="w-full min-h-screen">
      <div className="mx-auto max-w-7xl space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Offer Letter</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Generate and export internship offer letters.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[340px_1fr]">
          {/* Config Card */}
          <Card className="h-fit">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <FileText className="h-4 w-4 flex-shrink-0" /> Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0 space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Intern (Candidate)</Label>
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
                <Label htmlFor="odate" className="text-xs sm:text-sm">Offer Date</Label>
                <Input
                  id="odate"
                  type="date"
                  value={offerDate}
                  onChange={(e) => setOfferDate(e.target.value)}
                  className="text-xs sm:text-sm"
                />
              </div>

              {intern && (
                <div className="rounded-md border border-border bg-muted/40 p-2 sm:p-3 text-[10px] sm:text-xs space-y-1">
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

              <div className="flex gap-2 w-full">
                <Button onClick={onExport} disabled={!intern} className="flex-1 text-xs sm:text-sm">
                  <Download className="mr-2 h-3 sm:h-4 w-3 sm:w-4" /> Export
                </Button>
                <Button onClick={() => window.print()} variant="outline" disabled={!intern} className="text-xs sm:text-sm px-2 sm:px-3">
                  <Printer className="h-3 sm:h-4 w-3 sm:w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="border rounded-lg p-3 sm:p-4 md:p-6 bg-white shadow-sm max-h-[60vh] sm:max-h-[70vh] lg:max-h-[80vh] overflow-y-auto">
            {intern ? (
              <div ref={previewRef} className="print:m-0">
                <OfferLetterDocument intern={intern} offerDate={offerDate} />
              </div>
            ) : (
              <div ref={previewRef} className="text-muted-foreground text-xs sm:text-sm space-y-4">
                <p className="font-semibold">Offer Letter Template</p>
                <OfferLetterDocument intern={null} offerDate={offerDate} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
