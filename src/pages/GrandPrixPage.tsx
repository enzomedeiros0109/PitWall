import { getRaceByRound } from "@/api/jolpicaf1-api"
import SessionCard from "@/components/session-card"
import { formatDate } from "@/hooks/formatDate"
import { useQuery } from "@tanstack/react-query"
import { ArrowDown, ArrowLeft, Calendar, LoaderCircle } from "lucide-react"
import { useNavigate, useParams } from "react-router"

const GrandPrixPage = () => {
  const { season: seasonParam, round: roundParam } = useParams()
  const season = Number(seasonParam)
  const round = Number(roundParam)
  const validRoute = Number.isInteger(season) && Number.isInteger(round)
  const navigate = useNavigate()

  const { data, isPending, isFetching } = useQuery({
    queryKey: ['grandPrix', season, round],
    queryFn: () => getRaceByRound(season, round),
    enabled: validRoute,
  })

  const sessionsResults = useQuery({
      queryKey: ['sessionsResults'],
      queryFn: () => getAllSessions(country_name)
   })


  if (isPending || isFetching) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8">
        <LoaderCircle
          className="size-10 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
        <p role="status" className="text-2xl">Loading data...</p>
      </div>
    )
  }

  if (!data) {
    return <p>Race not found.</p>
  }

  return (
    <>
      <div className="p-4">
        <button
          className="flex items-center justify-center p-2 bg-accent rounded-md cursor-pointer hover:bg-accent-foreground/20"
          onClick={() => {
            navigate(`/`)
          }}
        >
          <ArrowLeft className="size-8" />
        </button>
      </div>
    </>
  )
}

export default GrandPrixPage
