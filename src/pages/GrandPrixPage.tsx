import { getRaceByRound } from "@/api/api"
import SessionCard from "@/components/session-card"
import { formatDate } from "@/hooks/formatDate"
import { useQuery } from "@tanstack/react-query"
import { Calendar } from "lucide-react"
import { useParams } from "react-router"

const GrandPrixPage = () => {
  const { season: seasonParam, round: roundParam } = useParams()
  const season = Number(seasonParam)
  const round = Number(roundParam)
  const validRoute = Number.isInteger(season) && Number.isInteger(round)

  const { data } = useQuery({
    queryKey: ['grandPrix', season, round],
    queryFn: () => getRaceByRound(season, round),
    enabled: validRoute,
  })

  const firstSession = data?.sessions[0]
  const lastSession = data?.sessions.at(-1)

  return (
    <div className="flex flex-col">
      <div className="flex flex-col justify-start px-8 pt-8">
        <h1 className="text-5xl font-semibold">{data?.race_name}</h1>
        <h2 className="text-3xl">{data?.country_name}, {data?.location}</h2>
        {firstSession && lastSession && (
          <div className="flex gap-2 items-center">
            <Calendar className="size-5" />
            <p className="text-lg">
              {formatDate(firstSession.date)} - {formatDate(lastSession.date)}
            </p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-5 gap-10 p-8">
        {data?.sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  )
}

export default GrandPrixPage
