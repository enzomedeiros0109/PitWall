import { getDriversStandings } from "@/api/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { useQuery } from "@tanstack/react-query"

const DriversStandings = () => {
   const driversStandingsQuery = useQuery({
      queryKey: ['driversStandings'],
      queryFn: getDriversStandings,
   })

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
               {driversStandingsQuery.data?.map((standing) => (
                  <TableRow key={standing.driver_id}>
                     <TableCell className="text-center">{standing.position}</TableCell>
                     <TableCell className="text-center">{standing.driver_code}</TableCell>
                     <TableCell className="text-center">{standing.points}</TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   )
}

export default DriversStandings
