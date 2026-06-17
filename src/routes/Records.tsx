import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2, FileText, ShieldCheck, Plus, Search, Download, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useIsMobile } from '@/hooks/use-responsive'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteIntern, listInterns } from '@/lib/interns'
import type { InternRecord } from '@/lib/types'

type SortKey = 'fullName' | 'department' | 'startDate' | 'endDate' | 'updatedAt'

function toCsv(rows: InternRecord[]): string {
  const headers = [
    'Full Name',
    'Name with Initials',
    'NIC',
    'Address',
    'Department',
    'Start Date',
    'End Date',
    'Supervisor',
    'Telephone',
  ]
  const esc = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`
  const lines = [headers.join(',')]
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
        .join(','),
    )
  }
  return lines.join('\n')
}

export default function Records() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['interns'],
    queryFn: listInterns,
  })

  const [q, setQ] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [delTarget, setDelTarget] = useState<InternRecord | null>(null)

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    const out = term
      ? rows.filter((r) =>
          [r.fullName, r.nic, r.department, r.supervisor, r.phone].some((v) =>
            v?.toLowerCase().includes(term),
          ),
        )
      : rows
    return [...out].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [rows, q, sortKey, sortDir])

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(k)
      setSortDir('asc')
    }
  }

  const confirmDelete = async () => {
    if (!delTarget) return
    await deleteIntern(delTarget.id)
    setDelTarget(null)
    qc.invalidateQueries({ queryKey: ['interns'] })
    toast.success('Record deleted')
  }

  const exportCsv = () => {
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interns_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full min-h-screen">
      <div className="mx-auto max-w-7xl space-y-3 p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Intern Records</h1>
            <p className="text-sm text-muted-foreground">
              Master data — {rows.length} record(s)
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              onClick={exportCsv} 
              disabled={filtered.length === 0}
              className="text-xs sm:text-sm flex-1 sm:flex-none"
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button 
              onClick={() => navigate('/records/new')}
              className="text-xs sm:text-sm flex-1 sm:flex-none"
            >
              <Plus className="mr-2 h-4 w-4" /> New
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="pl-9 w-full"
          />
        </div>

        {/* Mobile Cards View */}
        {isMobile ? (
          <div className="space-y-3">
            {isLoading ? (
              <Card className="p-6 text-center text-muted-foreground">
                Loading…
              </Card>
            ) : filtered.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                No records found
              </Card>
            ) : (
              filtered.map((r) => (
                <Card key={r.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">{r.fullName}</h3>
                        <p className="text-xs text-muted-foreground truncate">{r.nic}</p>
                      </div>
                      <Link to={`/records/${r.id}`}>
                        <Button size="sm" variant="ghost">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Department</p>
                        <p className="font-medium truncate">{r.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium truncate">{r.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Start</p>
                        <p className="font-medium">{r.startDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">End</p>
                        <p className="font-medium">{r.endDate}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link to={`/records/${r.id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full">
                          <Pencil className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDelTarget(r)}
                        className="flex-1"
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                      <Link to={`/offer-letter?id=${r.id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full">
                          <FileText className="h-3 w-3 mr-1" /> Letter
                        </Button>
                      </Link>
                    </div>
                    <Link to={`/nda?id=${r.id}`} className="w-full">
                      <Button size="sm" variant="outline" className="w-full">
                        <ShieldCheck className="h-3 w-3 mr-1" /> NDA
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        ) : (
          /* Desktop Table View */
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => toggleSort('fullName')} className="cursor-pointer">
                      Full Name
                    </TableHead>
                    <TableHead>NIC</TableHead>
                    <TableHead onClick={() => toggleSort('department')} className="cursor-pointer">
                      Department
                    </TableHead>
                    <TableHead onClick={() => toggleSort('startDate')} className="cursor-pointer">
                      Start
                    </TableHead>
                    <TableHead onClick={() => toggleSort('endDate')} className="cursor-pointer">
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
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.fullName}</TableCell>
                        <TableCell className="text-xs">{r.nic}</TableCell>
                        <TableCell>{r.department}</TableCell>
                        <TableCell>{r.startDate}</TableCell>
                        <TableCell>{r.endDate}</TableCell>
                        <TableCell>{r.phone}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Link to={`/records/${r.id}`}>
                              <Button size="sm" variant="outline">
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDelTarget(r)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            <Link to={`/offer-letter?id=${r.id}`}>
                              <Button size="sm" variant="outline">
                                <FileText className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Link to={`/nda?id=${r.id}`}>
                              <Button size="sm" variant="outline">
                                <ShieldCheck className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        <AlertDialog open={!!delTarget} onOpenChange={(open) => !open && setDelTarget(null)}>
          <AlertDialogContent className="w-[90vw] max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Record?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the record for {delTarget?.fullName}. This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 flex-col-reverse sm:flex-row">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
