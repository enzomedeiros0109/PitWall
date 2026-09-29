import { getLastestSessionsByCountry } from "@/api/api"
import SessionCard from "@/components/session-card"
import { useQuery } from "@tanstack/react-query"

type Props = {
  country_name: string
}

const GrandPrixPage = ({ country_name }: Props) => {

  const grandPixSessions = useQuery({
    queryKey: ['Grand Prix Sessions'],
    queryFn: () => getLastestSessionsByCountry(country_name)
  })

  return (
    <div className="grid grid-cols-5 gap-10 p-8">
      {grandPixSessions.data?.map((session) => (
        <SessionCard key={session.circuit_key} session={session} />
      ))}
    </div>
  )
}

export default GrandPrixPage
