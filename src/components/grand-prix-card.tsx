import { Button } from "@base-ui/react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Calendar, Clock, MapPin } from "lucide-react"
import { formatDate } from "@/hooks/formatDate"
import { formatLocalTime } from "@/hooks/formatLocalTime"
import { useNavigate } from "react-router"
import { useState } from "react"
import type { z } from "zod"
import { RaceSchema } from "@/schemas/jolpicaf1/sessions-schema"
import { OpenF1MeetingsSchema } from "@/schemas/openf1/meetings-schema"

type Race = z.infer<typeof RaceSchema>
type Meeting = z.infer<typeof OpenF1MeetingsSchema>[number]

type Props = Race & { meeting?: Meeting }

const GrandPixCard = ({
   season,
   round,
   race_name,
   date,
   time,
   country_name,
   location,
   meeting,
}: Props) => {
   const navigate = useNavigate()
   const [circuitImageFailed, setCircuitImageFailed] = useState(false)
   const isCancelled = meeting?.is_cancelled ?? false
   const meetingDates = meeting
      ? `${formatDate(meeting.date_start)} - ${formatDate(meeting.date_end)}`
      : formatDate(date)

   return (
      <Card className="relative mx-auto w-full max-w-sm pt-0">
         <div className="absolute inset-0 z-30 aspect-video" />
         {meeting && (
            <div className="relative z-20 flex aspect-video w-full items-center justify-center overflow-hidden bg-muted">
               {/* Keep the card readable when OpenF1 serves a broken circuit image URL. */}
               {meeting.circuit_image && !circuitImageFailed ? (
                  <img
                     src={meeting.circuit_image}
                     alt={`${meeting.circuit_short_name} circuit`}
                     className="h-full w-full object-cover brightness-80"
                     onError={() => setCircuitImageFailed(true)}
                  />
               ) : (
                  <span className="text-sm text-muted-foreground">{meeting.circuit_short_name}</span>
               )}
            </div>
         )}
         <CardHeader>
            <CardTitle>{meeting?.meeting_name ?? race_name}</CardTitle>
            <CardDescription>
               <div className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  <p>{meetingDates}</p>
               </div>
               {time && (
                  <div className="flex items-center gap-1">
                     <Clock className="size-4" />
                     <p>{formatLocalTime(`${date}T${time}`)}</p>
                  </div>
               )}
               <div className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  <p>{`${meeting?.country_name ?? country_name}, ${meeting?.location ?? location}`}</p>
               </div>
            </CardDescription>
         </CardHeader>
         <CardFooter className="hover:bg-accent">
            <Button
               disabled={isCancelled}
               className={`w-full ${isCancelled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
               onClick={() => navigate(`/grand-prix/${season}/${round}`)}
            >
               <p className={`text-lg ${isCancelled ? 'font-bold text-red-600' : ''}`}>
                  {isCancelled ? 'CANCELLED' : 'View Grand Prix'}
               </p>
            </Button>
         </CardFooter>
      </Card>
   )
}

export default GrandPixCard
