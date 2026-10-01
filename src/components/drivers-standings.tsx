import { getDrivers, getDriversStandings } from "@/api/openf1-api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { useQuery } from "@tanstack/react-query"

const DriversStandings = () => {

   const drivers = useQuery({
      queryKey: ['drivers'],
      queryFn: () => getDrivers()
   })

   const driversStandingsQuery = useQuery({
      queryKey: ['driversStandings'],
      queryFn: () => getDriversStandings(),
   })

   const driversByNumber = new Map(
      (drivers.data ?? []).map((driver) => [driver.driver_number, driver]),
   )

   return (
      <div className="bg-card rounded-xl">
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead className="w-20 text-center">Position</TableHead>
                  <TableHead className="w-20 text-center">Driver</TableHead>
                  <TableHead className="w-20 text-center">Points</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {driversStandingsQuery.isPending && (
                  <TableRow>
                     <TableCell colSpan={3} className="text-center">Loading driver standings…</TableCell>
                  </TableRow>
               )}
               {driversStandingsQuery.isError && (
                  <TableRow>
                     <TableCell colSpan={3} className="text-center">Could not load driver standings.</TableCell>
                  </TableRow>
               )}
               {driversStandingsQuery.data?.map((standing) => {
                  const driver = driversByNumber.get(standing.driver_number)

                  return (
                     <TableRow key={standing.driver_number}>
                        <TableCell
                           className="text-center font-bold"
                           style={{ color: standing.position_current === 1 ? '#FFD700' : standing.position_current === 2 ? '#C0C0C0' : standing.position_current === 3 ? '#CD7F32' : ''}}
                        >
                           {standing.position_current}
                        </TableCell>
                        <TableCell className="flex gap-2 text-start items-center">
                           <div className="h-6 w-1" style={{ background: `#${driver?.team_colour}` }}></div>
                           {driver?.full_name ?? `Driver ${standing.driver_number}`}

                        </TableCell>
                        <TableCell className="text-center">{standing.points_current}</TableCell>
                     </TableRow>
                  )
               })}
            </TableBody>
         </Table>
      </div>
   )
}

export default DriversStandings
