import { Button } from "@base-ui/react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Calendar, Clock, MapPin } from "lucide-react"
import { getSessionImage } from "@/data/session-images"
import { formatDate } from "@/hooks/formatDate"
import { formatLocalTime } from "@/hooks/formatLocalTime"
import { useNavigate } from "react-router"
import type { z } from "zod"
import { RaceSchema } from "@/schemas/sessions-schema"

type Race = z.infer<typeof RaceSchema>

type Props = Race

const GrandPixCard = ({
   season,
   round,
   race_name,
   date,
   time,
   country_name,
   location,
   circuit_short_name,
}: Props) => {
   const image = getSessionImage(circuit_short_name, location)
   const navigate = useNavigate()

   return (
      <Card className="relative mx-auto w-full max-w-sm pt-0">
         <div className="absolute inset-0 z-30 aspect-video" />
         <img
            src={image}
            alt={`${circuit_short_name} circuit`}
            className="relative z-20 aspect-video w-full object-cover brightness-80"
         />
         <CardHeader>
            <CardTitle>{race_name}</CardTitle>
            <CardDescription>
               <div className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  <p>{formatDate(date)}</p>
               </div>
               {time && (
                  <div className="flex items-center gap-1">
                     <Clock className="size-4" />
                     <p>{formatLocalTime(`${date}T${time}`)}</p>
                  </div>
               )}
               <div className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  <p>{`${country_name}, ${location}`}</p>
               </div>
            </CardDescription>
         </CardHeader>
         <CardFooter className="hover:bg-accent">
            <Button
               className="w-full cursor-pointer"
               onClick={() => navigate(`/grand-prix/${season}/${round}`)}
            >
               <p className="text-lg">View Grand Prix</p>
            </Button>
         </CardFooter>
      </Card>
   )
}

export default GrandPixCard
