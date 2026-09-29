import { getSessions } from "@/api/api"
import DriversStandings from "@/components/drivers-standings"
import F1Logo from "@/components/f1-logo"
import GrandPixCard from "@/components/grand-prix-card"
import TeamsStandings from "@/components/teams-standings"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useQuery } from "@tanstack/react-query"

const HomePage = () => {
   const { data } = useQuery({
      queryKey: ['sessions'],
      queryFn: getSessions
   })

   const now = Date.now()
   const firstUpcomingIndex = data?.reduce((nearestIndex, session, index, sessions) => {
      const sessionStart = new Date(session.date_start).getTime()
      if (sessionStart <= now) return nearestIndex

      if (
         nearestIndex === -1 ||
         sessionStart < new Date(sessions[nearestIndex].date_start).getTime()
      ) {
         return index
      }

      return nearestIndex
   }, -1) ?? -1

   return (
      <div className="flex flex-col items-center gap-8 p-8">

         <div>
            <F1Logo />
         </div>

         {data && (
            <Carousel
               key={firstUpcomingIndex}
               className="w-full max-w-300"
               opts={{
                  startIndex: firstUpcomingIndex >= 0 ? firstUpcomingIndex : 0,
                  slidesToScroll: 1,
               }}
            >
               <CarouselContent className="-ml-1">
                  {data.map((session) => (
                     <CarouselItem key={session.session_key} className="basis-1/2 pl-1 lg:basis-1/3">
                        <div className="p-1">
                           <GrandPixCard {...session} />
                        </div>
                     </CarouselItem>
                  ))}
               </CarouselContent>
               <CarouselPrevious />
               <CarouselNext />
            </Carousel>
         )}

         <div className="grid grid-cols-2 w-auto gap-x-30">
            <DriversStandings />
            <TeamsStandings />
         </div>
      </div>
   )
}

export default HomePage