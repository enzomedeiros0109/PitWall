import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { CalendarDaysIcon, Clock } from "lucide-react"
import { useQueries, useQuery } from "@tanstack/react-query"
import { getSessionResult } from "@/api/jolpicaf1-api"
import { formatDate } from "@/hooks/formatDate"
import { formatLocalTime } from "@/hooks/formatLocalTime"
import type { z } from "zod"
import { SessionSchema } from "@/schemas/jolpicaf1/sessions-schema"
import { getTeamColor } from "@/lib/team-colors"
import { getAllSessions, getOpenF1SessionResult, getPracticeSessions } from "@/api/openf1-api"

type Session = z.infer<typeof SessionSchema>

type Props = {
   session: Session
   country_name: string
}

const SessionCard = ({ session }: Props) => {

   return (
      <div></div>
   )

}

export default SessionCard
