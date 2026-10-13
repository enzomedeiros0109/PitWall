import { getRaceByRound } from "@/api/jolpicaf1-api"
import { getAllSessions } from "@/api/openf1-api"
import SessionCard from "@/components/session-card"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, LoaderCircle } from "lucide-react"
import { useNavigate, useParams } from "react-router"
import { formatDate } from "@/hooks/formatDate"
import { getSessionImage } from "@/data/session-images"
import { Card } from "@/components/ui/card"

const GrandPrixPage = () => {
  const [expandedPracticeSessionKey, setExpandedPracticeSessionKey] = useState<number | null>(null)
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
    queryKey: ['sessions', season, country_name],
    queryFn: () => getAllSessions(season, country_name!),
    enabled: Boolean(country_name),
  })

  const sessions = sessionsQuery.data ?? []
  const selectedRaceSessions = sessions.filter((session) =>
    session.year === season &&
    session.location.toLowerCase() === raceQuery.data?.location.toLowerCase()
  )
  const raceQualySessions = selectedRaceSessions
    .filter((session) => ['Qualifying', 'Sprint', 'Race'].includes(session.session_type))
    .sort((a, b) => Date.parse(a.date_start) - Date.parse(b.date_start))

  const practiceSessions = selectedRaceSessions
    .filter((session) => session.session_type.includes('Practice'))
    .slice(0, 3)
  const backgroundSession = selectedRaceSessions[0]
  const backgroundImage = backgroundSession
    ? getSessionImage(backgroundSession.circuit_short_name, backgroundSession.location)
    : undefined

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
    <div className="relative isolate min-h-screen">
      {backgroundImage && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${backgroundImage}")` }}
        />
      )}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-black/45" />
      <div className="relative z-10">
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

      <Card className="mx-24 bg-linear-to-r from-background/40 to-chart-5">
        <div className="flex flex-col gap-4 p-8">
        <h1 className="text-5xl font-bold text-white drop-shadow-lg">{raceQualySessions[0].country_name} Grand Prix</h1>
        <div className="flex gap-8 items-center">
          <h2 className="text-3xl font-semibold text-white drop-shadow-lg">{raceQualySessions[0].location}</h2>
          <h2 className="text-xl text-white/80 drop-shadow-lg">{formatDate(practiceSessions[0].date_start)} - {formatDate(raceQualySessions[raceQualySessions.length - 1].date_end)}</h2>
        </div>
      </div>
      </Card>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,24rem),1fr))] items-start justify-center justify-items-center gap-4 p-4">
        {raceQualySessions.map((session) => (
          <SessionCard
            key={session.session_key}
            session={session}
          />
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,24rem),1fr))] items-start justify-center justify-items-center gap-4 p-4 pt-0">
        {practiceSessions.map((session) => (
          <SessionCard
            key={session.session_key}
            session={session}
            isPracticeResultsOpen={expandedPracticeSessionKey === session.session_key}
            onPracticeResultsToggle={() =>
              setExpandedPracticeSessionKey((current) =>
                current === session.session_key ? null : session.session_key,
              )
            }
          />
        ))}
      </div>


      </div>
    </div>
  )
}

export default GrandPrixPage
