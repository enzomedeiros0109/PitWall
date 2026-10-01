import { getOpenF1SessionResult } from "@/api/openf1-api"
import { OpenF1SessionResultSchema } from "@/schemas/openf1/session-result-schema"
import type { OpenF1SessionSchema } from "@/schemas/openf1/sessions-schema"
import { useQuery } from "@tanstack/react-query"
import type { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"

type Session = z.infer<typeof OpenF1SessionSchema>[number]
type SessionResult = z.infer<typeof OpenF1SessionResultSchema>[number]

type Props = {
   session: Session
}

const getResultStatus = (result: SessionResult) => {
   if (result.dsq) return "DSQ"
   if (result.dns) return "DNS"
   if (result.dnf) return "DNF"
   return `P${result.position}`
}

const SessionCard = ({ session }: Props) => {
   const resultQuery = useQuery({
      queryKey: ['sessionResult', session.session_key],
      queryFn: () => getOpenF1SessionResult(session.session_key),
   })

   return (
      <Card>
         <CardHeader>
            <CardTitle>{session.session_name}</CardTitle>
            <CardDescription>
               {session.location} · {session.year}
            </CardDescription>
         </CardHeader>
         <CardContent>
         </CardContent>
      </Card>
   )
}

export default SessionCard
