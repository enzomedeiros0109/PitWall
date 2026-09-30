import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { CalendarDaysIcon, Clock } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getSessionResult } from "@/api/api"
import { formatDate } from "@/hooks/formatDate"
import { formatLocalTime } from "@/hooks/formatLocalTime"
import type { z } from "zod"
import { SessionSchema } from "@/schemas/sessions-schema"
import { getTeamColor } from "@/lib/team-colors"

type Session = z.infer<typeof SessionSchema>

type Props = {
   session: Session
}

const SessionCard = ({ session }: Props) => {
   const sessionResults = useQuery({
      queryKey: ['sessionResults', session.id],
      queryFn: () => getSessionResult(
         session.season,
         session.round,
         session.result_type!,
      ),
      enabled: session.result_type !== null,
   })

   return (
      <Card className="relative w-120">
         <CardHeader className="flex flex-col justify-center">
            <CardTitle className="text-3xl text-center capitalize">{session.session_name}</CardTitle>
            <CardDescription>
               <div className="flex flex-col gap-2">
                  <div className="flex gap-1 items-center">
                     <CalendarDaysIcon className="size-5" />
                     <p>{formatDate(session.date)}</p>
                  </div>
                  {session.time && (
                     <div className="flex gap-1 items-center">
                        <Clock className="size-5" />
                        <p>{formatLocalTime(`${session.date}T${session.time}`)}</p>
                     </div>
                  )}
               </div>
            </CardDescription>
         </CardHeader>
         {session.result_type !== null &&
            <CardFooter>
               <div className="flex flex-col gap-4">
                  {sessionResults.isError ? (
                     <p>Could not load this session’s results.</p>
                  ) : sessionResults.data?.length === 0 ? (
                     <p>No results available yet.</p>
                  ) : (
                     sessionResults.data?.map((result) => (
                        <div key={result.driver_id} className="flex items-center gap-3">
                           {result.position === 'R' ?
                              <p className="w-9 p-1 text-center text-red-500 tabular-nums bg-white/10 rounded-md">DNF</p>
                              :
                              <p className="w-9 p-1 text-center tabular-nums bg-white/10 rounded-md">{result.position}</p>}
                           <span
                              aria-hidden="true"
                              className="h-5 w-1"
                              style={{ backgroundColor: getTeamColor(result.constructor_id) }}
                           />

                           <p className="text-lg">{result.driver_name}</p>
                        </div>
                     ))
                  )}
               </div>
            </CardFooter>
         }
      </Card>
   )
}

export default SessionCard
