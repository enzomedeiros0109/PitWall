import { Button } from "@base-ui/react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Calendar, Clock, MapPin } from "lucide-react"
import { getSessionImage } from "@/data/session-images"

type Props = {
   country_name: string,
   date_end: string,
   date_start: string,
   gmt_offset: string,
   location: string,
   circuit_short_name: string,
}

function formatDate(date: string): string {
   const [year, month, day] = date.slice(0, 10).split('-')
   return `${day}/${month}/${year}`
}

const GrandPixCard = ({ country_name, date_start, gmt_offset, location, circuit_short_name }: Props) => {
   const image = getSessionImage(circuit_short_name, location)

   return (
      <Card className="relative mx-auto w-full max-w-sm pt-0">
         <div className="absolute inset-0 z-30 aspect-video" />
         <img
            src={image}
            alt={`${circuit_short_name} Grand Prix circuit`}
            className="relative z-20 aspect-video w-full object-cover brightness-80"
         />
         <CardHeader>
            <CardTitle>{circuit_short_name} Grand Prix</CardTitle>
            <CardDescription>

               <div className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  <p>{`${formatDate(date_start)}`}</p>
               </div>

               <div className="flex items-center gap-1">
                  <Clock className="size-4" />
                  <p>{`${gmt_offset}`}</p>
               </div>

               <div className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  <p>{`${country_name}, ${location}`}</p>
               </div>

            </CardDescription>
         </CardHeader>
         <CardFooter>
            <Button className="w-full">View Grand Prix</Button>
         </CardFooter>
      </Card>
   )
}

export default GrandPixCard