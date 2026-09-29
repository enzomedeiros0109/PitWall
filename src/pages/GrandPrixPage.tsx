import { getLastestSessionsByCountry } from "@/api/api"
import SessionCard from "@/components/session-card"
import { formatDate } from "@/hooks/formatDate"
import { useQuery } from "@tanstack/react-query"
import { Calendar } from "lucide-react"
import { useParams } from "react-router"

const GrandPrixPage = () => {
  const { country_name } = useParams()

  const { data } = useQuery({
    queryKey: ['Grand Prix Sessions', country_name],
    queryFn: () => {
      if (!country_name) throw new Error("Grand Prix country is missing")
      return getLastestSessionsByCountry(country_name)
    },
    enabled: Boolean(country_name),
  })

  return (
    <div className="flex flex-col">
      <div className="flex flex-col justify-start px-8 pt-8">
        <h1 className="text-5xl font-semibold">{data?.[0]?.circuit_short_name} Grand Prix</h1>

        <h2 className="text-3xl">{data?.[0]?.country_name}, {data?.[0]?.location}</h2>

        <div className="flex gap-2 items-center">
          <Calendar className="size-5"/>
          <p className="text-lg">
            {data?.[0]?.date_start ? formatDate(data[0].date_start) : ""} - {data?.[0]?.date_end ? formatDate(data[0].date_end) : ""}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-10 p-8">
        {data?.map((session) => (
          <SessionCard key={session.session_key} session={session} />
        ))}
      </div>
    </div>
  )
}

export default GrandPrixPage
