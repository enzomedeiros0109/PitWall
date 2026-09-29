import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { z } from "zod"
import { SessionSchema } from "@/schemas/sessions-schema"
import { CalendarDaysIcon, MapPin, X } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getDriversInfo, getSessionResult } from "@/api/api"
import { formatDate } from "@/hooks/formatDate"

type Session = z.infer<typeof SessionSchema>[number]

type Props = {
   session: Session
}

function formatLocalTime(date: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

const SessionCard = ({ session }: Props) => {

   const driversInfo = useQuery({
      queryKey: ['driversInfo', session.session_key],
      queryFn: () => getDriversInfo(session.session_key)
   })

   const sessionResults = useQuery({
      queryKey: ['sessionResults', session.session_key],
      queryFn: () => getSessionResult(session.session_key)
   })

   return (
      <div>
         <Card className="relative mx-auto w-full max-w-sm">
            <CardHeader className="flex flex-col justify-center">
               <CardTitle className="text-3xl text-center">{session.session_name}</CardTitle>
               <CardDescription>
                  <div className="flex flex-col gap-2">

                     <div className="flex gap-1 items-center">
                        <CalendarDaysIcon className="size-5" />
                        <p>{formatDate(session.date_start)} - {formatLocalTime(session.date_start)}</p>
                     </div>

                     {
                        session.is_cancelled &&
                        <div className="flex gap-1 items-center">
                           <p className="text-red-500 font-bold">Session cancelled</p>
                        </div>
                     }

                  </div>
               </CardDescription>
            </CardHeader>
            <CardFooter>
               <div className="flex flex-col gap-4">
                  {sessionResults.isPending || driversInfo.isPending ? (
                     <p>Loading session results…</p>
                  ) : sessionResults.isError || driversInfo.isError ? (
                     <p>Could not load this session’s results.</p>
                  ) : sessionResults.data?.length === 0 ? (
                     <p>No results available for this session.</p>
                  ) : (
                     sessionResults.data
                        ?.filter((result) => result.session_key === session.session_key)
                        .map((result) => {
                           const driver = driversInfo.data?.find(
                              (driver) => driver.driver_number === result.driver_number,
                           )

                           if (!driver) return null

                           return (
                              <div key={result.driver_number} className="flex gap-2">
                                 <p
                                    className="border-l-4 pl-2"
                                    style={{ borderColor: `#${driver.team_colour}` }}
                                 >
                                    {result.position ? result.position : 'DNF'}
                                 </p>
                                 <p>
                                    {driver.broadcast_name}
                                 </p>
                              </div>
                           )
                        })
                  )}
               </div>
            </CardFooter>
         </Card>
      </div>
   )
}

export default SessionCard