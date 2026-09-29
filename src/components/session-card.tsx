import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { z } from "zod"
import { SessionSchema } from "@/schemas/sessions-schema"
import { CalendarDaysIcon, MapPin, X } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getDriversInfo, getSessionResult } from "@/api/api"

type Session = z.infer<typeof SessionSchema>[number]

type Props = {
   session: Session
}

const formatDate = (date: string) => {
   return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
   }).format(new Date(date))
}

const handleBoolean = (isCancelled: boolean) => {
   return isCancelled === true ? "Yes" : "No"
}

const SessionCard = ({ session }: Props) => {

   const driversInfo = useQuery({
      queryKey: ['driversInfo'],
      queryFn: () => getDriversInfo(session.session_key)
   })

   const sessionResults = useQuery({
      queryKey: ['sessionResults'],
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
                        <p>{formatDate(session.date_start)}</p>
                     </div>

                     <div className="flex gap-1 items-center">
                        <MapPin className="size-5" />
                        <p>{session.country_name}, {session.location}</p>
                     </div>

                     <div className="flex gap-1 items-center">
                        <X className="size-5" />
                        <p>Cancelled: {handleBoolean(session.is_cancelled)}</p>
                     </div>

                  </div>
               </CardDescription>
            </CardHeader>
            <CardFooter>
               <div className="flex flex-col gap-4">
                  {sessionResults.data?.map((result) => {
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
                              {result.position}
                           </p>
                           <p>
                              {driver.first_name} {driver.last_name}
                           </p>
                        </div>
                     )
                  })}

               </div>
            </CardFooter>
         </Card>
      </div>
   )
}

export default SessionCard