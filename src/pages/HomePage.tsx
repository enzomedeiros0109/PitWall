import { getRaces } from "@/api/jolpicaf1-api"
import { getMeetings } from "@/api/openf1-api"
import DriversStandings from "@/components/drivers-standings"
import F1Logo from "@/components/f1-logo"
import GrandPixCard from "@/components/grand-prix-card"
import TeamsStandings from "@/components/teams-standings"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useQuery } from "@tanstack/react-query"
import { matchMeetingToRace } from "@/data/match-meeting"
import f1Background from "@/assets/f1-background.jpg"

const HomePage = () => {
   const season = new Date().getFullYear()
   const { data } = useQuery({
      queryKey: ['races', season],
      queryFn: () => getRaces(season),
   })
   const meetingsQuery = useQuery({
      queryKey: ['meetings', season],
      queryFn: () => getMeetings(season),
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
      <div className="relative isolate min-h-screen">
         <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 scale-105 bg-cover bg-center bg-no-repeat blur-md brightness-75"
            style={{ backgroundImage: `url("${f1Background}")` }}
         />
         <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-black/45" />
         <div className="relative z-10 flex min-h-screen flex-col items-center gap-8 p-8">
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
                              <GrandPixCard {...race} meeting={matchMeetingToRace(race, meetingsQuery.data ?? [])} />
                           </div>
                        </CarouselItem>
                     ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
               </Carousel>
            )}

            <div className="grid grid-cols-2 w-auto gap-x-30">
               <DriversStandings year={season} />
               <TeamsStandings year={season} />
            </div>
         </div>
      </div>
   )
}

export default HomePage
