import { getDrivers, getDriversStandings } from "@/api/openf1-api"
import { useLatestCompletedRace } from "@/hooks/useLatestCompletedRace"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { getDriverSlug } from "@/data/driver-slug"

type DriversStandingsProps = {
   year: number
}

const DriversStandings = ({ year }: DriversStandingsProps) => {
   const navigate = useNavigate()
   const raceQuery = useLatestCompletedRace(year)
   const raceSessionKey = raceQuery.session?.session_key

   const drivers = useQuery({
      queryKey: ['drivers', raceSessionKey],
      queryFn: () => getDrivers(String(raceSessionKey)),
      enabled: raceSessionKey !== undefined,
   })

   const driversStandingsQuery = useQuery({
      queryKey: ['driversStandings', raceSessionKey],
      queryFn: () => getDriversStandings(raceSessionKey!),
      enabled: raceSessionKey !== undefined,
   })

   const driversByNumber = new Map(
      (drivers.data ?? []).map((driver) => [driver.driver_number, driver]),
   )

   return (
      <div className="overflow-hidden rounded-xl bg-background/85 backdrop-blur-sm border border-white/50">
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead className="w-20 text-center">Position</TableHead>
                  <TableHead className="w-20 text-center">Driver</TableHead>
                  <TableHead className="w-20 text-center">Points</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {(raceQuery.isPending || (raceSessionKey !== undefined && driversStandingsQuery.isPending)) && (
                  <TableRow>
                     <TableCell colSpan={3} className="text-center">Loading driver standings…</TableCell>
                  </TableRow>
               )}
               {(raceQuery.isError || driversStandingsQuery.isError) && (
                  <TableRow>
                     <TableCell colSpan={3} className="text-center">Could not load driver standings.</TableCell>
                  </TableRow>
               )}
               {raceQuery.isSuccess && !raceQuery.session && (
                  <TableRow>
                     <TableCell colSpan={3} className="text-center">No completed race this season yet.</TableCell>
                  </TableRow>
               )}
               {driversStandingsQuery.data?.map((standing) => {
                  const driver = driversByNumber.get(standing.driver_number)

                  return (
                     <TableRow key={standing.driver_number}>
                        <TableCell colSpan={3} className="p-0">
                           <button
                              type="button"
                              className="grid w-full grid-cols-[5rem_minmax(0,1fr)_5rem] items-center p-2 transform transition-all hover:scale-110 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-default disabled:hover:scale-100"
                              aria-label={`View ${driver?.full_name ?? `Driver ${standing.driver_number}`} profile`}
                              disabled={!driver}
                              onClick={() => driver && navigate(`/driver/${year}/${getDriverSlug(driver.full_name)}`)}
                           >
                              <span
                                 className="text-center font-bold"
                                 style={{ color: standing.position_current === 1 ? '#FFD700' : standing.position_current === 2 ? '#C0C0C0' : standing.position_current === 3 ? '#CD7F32' : '' }}
                              >
                                 {standing.position_current}
                              </span>
                              <span className="flex items-center gap-2 text-start">
                                 <span className="h-6 w-0.5 shrink-0" style={{ background: `#${driver?.team_colour}` }} />
                                 {driver?.full_name ?? `Driver ${standing.driver_number}`}
                              </span>
                              <span className="text-center">{standing.points_current}</span>
                           </button>
                        </TableCell>
                     </TableRow>
                  )
               })}
            </TableBody>
         </Table>
      </div>
   )
}

export default DriversStandings
