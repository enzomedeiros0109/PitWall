import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { CalendarDaysIcon, Clock } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getSessionResult } from "@/api/api"
import { formatDate } from "@/hooks/formatDate"
import { formatLocalTime } from "@/hooks/formatLocalTime"
import type { z } from "zod"
import { SessionSchema } from "@/schemas/sessions-schema"

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
      <Card className="relative mx-auto w-full max-w-sm">
         <CardHeader className="flex flex-col justify-center">
            <CardTitle className="text-3xl text-center">{session.session_name}</CardTitle>
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
         <CardFooter>
            <div className="flex flex-col gap-4">
               {session.result_type === null ? (
                  <p>Jolpica does not provide results for this session.</p>
               ) : sessionResults.isPending ? (
                  <p>Loading session results…</p>
               ) : sessionResults.isError ? (
                  <p>Could not load this session’s results.</p>
               ) : sessionResults.data.length === 0 ? (
                  <p>No results available yet.</p>
               ) : (
                  sessionResults.data.map((result) => (
                     <div key={result.driver_id} className="flex gap-2">
                        <p className="border-l-4 pl-2">{result.position}</p>
                        <p>{result.driver_code} · {result.driver_name}</p>
                     </div>
                  ))
               )}
            </div>
         </CardFooter>
      </Card>
   )
}

export default SessionCard
