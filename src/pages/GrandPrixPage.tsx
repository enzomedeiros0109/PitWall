import { getRaceByRound } from "@/api/jolpicaf1-api"
import { getAllSessions } from "@/api/openf1-api"
import SessionCard from "@/components/session-card"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, LoaderCircle } from "lucide-react"
import { useNavigate, useParams } from "react-router"

const GrandPrixPage = () => {
  const navigate = useNavigate()
  const { season: seasonParam, round: roundParam } = useParams()
  const season = Number(seasonParam)
  const round = Number(roundParam)

  const raceQuery = useQuery({
    queryKey: ['grandPrix', season, round],
    queryFn: () => getRaceByRound(season, round),
    enabled: Number.isInteger(season) && Number.isInteger(round),
  })

  const country_name = raceQuery.data?.country_name

  const sessionsQuery = useQuery({
    queryKey: ['sessions', country_name],
    queryFn: () => getAllSessions(country_name!),
    enabled: Boolean(country_name),
  })

  const sessions = sessionsQuery.data ?? []
  const selectedRaceSessions = sessions.filter((session) =>
    session.year === season &&
    session.location.toLowerCase() === raceQuery.data?.location.toLowerCase()
  )
  const raceQualySessions = selectedRaceSessions.filter(
    (session) => !session.session_type.includes('Practice')
  )
  const practiceSessions = selectedRaceSessions
    .filter((session) => session.session_type.includes('Practice'))
    .slice(0, 3)

  if (raceQuery.isPending || sessionsQuery.isPending) {
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

  return (
    <div>
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

      <div>
        {raceQualySessions.map((session) => (
          <SessionCard
            key={session.session_key}
            session={session}
          />
        ))}
      </div>

      <div>
        {practiceSessions.map((session) => (
          <SessionCard
            key={session.session_key}
            session={session}
          />
        ))}
      </div>


    </div>
  )
}

export default GrandPrixPage
