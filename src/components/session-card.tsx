import { getDrivers, getOpenF1SessionResult } from "@/api/openf1-api"
import type { OpenF1SessionResultSchema } from "@/schemas/openf1/session-result-schema"
import type { OpenF1SessionSchema } from "@/schemas/openf1/sessions-schema"
import { useQuery } from "@tanstack/react-query"
import type { z } from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Calendar, LocateIcon, MapPin } from "lucide-react"

type Session = z.infer<typeof OpenF1SessionSchema>[number]
type SessionResult = z.infer<typeof OpenF1SessionResultSchema>[number]

type Props = {
   session: Session
   isPractice: boolean
}

const getResultStatus = (result: SessionResult) => {
   if (result.dsq) return "DSQ"
   if (result.dns) return "DNS"
   if (result.dnf) return "DNF"
   return `P${result.position}`
}

function formatDate(isoString: string): string {
   const date = new Date(isoString);

   return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
   }).format(date);
}

const SessionCard = ({ session, isPractice }: Props) => {
   const sessionResult = useQuery({
      queryKey: ['sessionResult', session.session_key],
      queryFn: () => getOpenF1SessionResult(session.session_key),
   })

   const drivers = useQuery({
      queryKey: ['drivers', session.session_key],
      queryFn: () => getDrivers(String(session.session_key)),
   })

   {
      if (isPractice) {
         return (
            <div>
               <Card className="w-100">
                  <CardHeader>
                     <CardTitle className="text-3xl">{session.session_name}</CardTitle>
                     <CardDescription className="flex flex-col gap-2">

                        <div className="flex gap-1 items-center">
                           <Calendar className="size-5" />
                           <p className="text-base">{formatDate(session.date_start)}</p>
                        </div>

                        <div className="flex gap-1 items-center">
                           <MapPin className="size-5" />
                           <p className="text-base">{session.country_name}, {session.location}</p>
                        </div>

                        {session.is_cancelled &&
                           <div className="flex gap-1 items-center">
                              <p className="text-red-500 text-base font-semibold">Cancelled</p>
                           </div>
                        }

                     </CardDescription>
                  </CardHeader>
                  <CardFooter className="w-full flex-col items-stretch gap-2">
                        {sessionResult.data?.map((driverResult) => {
                           const driver = drivers.data?.find(
                              (item) => item.driver_number === driverResult.driver_number,
                           )

                           return (
                              <div
                                 key={driverResult.driver_number}
                                 className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 border-b py-2 last:border-b-0"
                              >
                                 <p className="text-center">{driverResult.position}</p>
                                 <p
                                    className="border-l-2 pl-3"
                                    style={{ borderColor: driver?.team_colour }}
                                 >
                                    {driver?.broadcast_name ?? `Driver ${driverResult.driver_number}`}
                                 </p>
                                 <p className="text-right">+{driverResult.gap_to_leader}</p>
                              </div>
                           )
                        })}
                  </CardFooter>
               </Card>
            </div>
         )
      }
   }

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
