import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, FileText, ShieldCheck, UserPlus } from 'lucide-react'
import { listInterns } from '@/lib/interns'
import { firebaseEnabled } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  const { data: interns = [], isLoading } = useQuery({
    queryKey: ['interns'],
    queryFn: listInterns,
  })

  const active = interns.filter((r) => {
    const now = new Date().toISOString().slice(0, 10)
    return r.startDate <= now && r.endDate >= now
  }).length

  const stats = [
    { label: 'Total Interns', value: interns.length, icon: Users, to: '/records' },
    { label: 'Active Now', value: active, icon: UserPlus, to: '/records' },
    { label: 'Offer Letters', value: interns.length, icon: FileText, to: '/offer-letter' },
    { label: 'NDA Documents', value: interns.length, icon: ShieldCheck, to: '/nda' },
  ]

  return (
    <div className="w-full min-h-screen">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-semibold">Dashboard</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage intern master records and generate offer letters & NDA agreements.
            </p>
          </div>
          <Badge variant={firebaseEnabled ? 'default' : 'secondary'} className="w-fit">
            {firebaseEnabled ? 'Firebase' : 'Local'}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Link key={s.label} to={s.to}>
              <Card className="transition-shadow hover:shadow-elegant h-full">
                <CardContent className="flex flex-col gap-2 p-3 sm:p-4 md:p-5">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground truncate">{s.label}</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-2xl sm:text-3xl font-semibold">{isLoading ? '…' : s.value}</p>
                    <div className="rounded-lg sm:rounded-xl bg-accent p-2 sm:p-3 text-accent-foreground flex-shrink-0">
                      <s.icon className="h-4 sm:h-5 w-4 sm:w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Records */}
        <Card className="w-full">
          <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3 md:pb-4">
            <CardTitle className="text-sm sm:text-base">Recent Records</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            {isLoading ? (
              <p className="text-xs sm:text-sm text-muted-foreground">Loading…</p>
            ) : interns.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 sm:p-8 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  No intern records yet.{' '}
                  <Link to="/records/new" className="text-primary underline">
                    Create the first record
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {interns.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-2 sm:py-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{r.fullName}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        {r.department} · {r.startDate} → {r.endDate}
                      </p>
                    </div>
                    <Link
                      to={`/records/${r.id}`}
                      className="text-[10px] sm:text-xs text-primary hover:underline whitespace-nowrap flex-shrink-0"
                    >
                      Edit
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
