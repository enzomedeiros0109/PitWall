import { getSessions } from "@/api/api"
import DriversStandings from "@/components/drivers-standings"
import F1Logo from "@/components/f1-logo"
import GrandPixCard from "@/components/grand-prix-card"
import TeamsStandings from "@/components/teams-standings"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useQuery } from "@tanstack/react-query"

type Props = {}

const HomePage = (props: Props) => {
   const { data, isFetching, isPending } = useQuery({
      queryKey: ['sessions'],
      queryFn: getSessions
   })

   return (
      <div className="flex flex-col items-center gap-8 p-8">

         <div>
            <F1Logo />
         </div>

         <Carousel className="w-full max-w-300">
            <CarouselContent className="-ml-1">
               {data?.filter((session) => new Date(session.date_start).getTime() > Date.now()).map((session) => (
                  <CarouselItem key={session.circuit_key} className="basis-1/2 pl-1 lg:basis-1/3">
                     <div className="p-1">
                        <GrandPixCard key={session.session_key} {...session} />
                     </div>
                  </CarouselItem>
               ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
         </Carousel>

         <div className="grid grid-cols-2 w-auto gap-x-30">
            <DriversStandings />
            <TeamsStandings />
         </div>
      </div>
   )
}

export default HomePage