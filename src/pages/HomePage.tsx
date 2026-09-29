import { getRaces } from "@/api/api"
import DriversStandings from "@/components/drivers-standings"
import F1Logo from "@/components/f1-logo"
import GrandPixCard from "@/components/grand-prix-card"
import TeamsStandings from "@/components/teams-standings"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useQuery } from "@tanstack/react-query"

const HomePage = () => {
   const season = new Date().getFullYear()
   const { data } = useQuery({
      queryKey: ['races', season],
      queryFn: () => getRaces(season),
   })

   const now = Date.now()
   const firstUpcomingIndex = data?.reduce((nearestIndex, race, index, races) => {
      const raceStart = Date.parse(`${race.date}T${race.time ?? '23:59:59Z'}`)
      if (raceStart <= now) return nearestIndex

      if (
         nearestIndex === -1 ||
         raceStart < Date.parse(`${races[nearestIndex].date}T${races[nearestIndex].time ?? '23:59:59Z'}`)
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
                  {data.map((race) => (
                     <CarouselItem key={`${race.season}-${race.round}`} className="basis-1/2 pl-1 lg:basis-1/3">
                        <div className="p-1">
                           <GrandPixCard {...race} />
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
