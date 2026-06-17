import { useQuery } from '@tanstack/react-query'
import { InternForm } from '@/components/intern-form'
import { listInterns } from '@/lib/interns'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function RecordNew() {
  const { data: existing = [] } = useQuery({
    queryKey: ['interns'],
    queryFn: listInterns,
  })

  return (
    <div className="w-full min-h-screen">
      <div className="mx-auto max-w-4xl space-y-4 p-3 sm:p-4 md:p-6">
        <Link
          to="/records"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">New Intern Record</h1>
          <p className="text-sm text-muted-foreground">
            Type a name to auto-fill if the candidate already exists.
          </p>
        </div>
        <InternForm existing={existing} />
      </div>
    </div>
  )
}
