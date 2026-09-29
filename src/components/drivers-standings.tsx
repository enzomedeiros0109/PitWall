import { getDriversInfo, getDriversStandings } from "@/api/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { useQuery } from "@tanstack/react-query"

type Props = {}

const DriversStandings = ({ }: Props) => {

   const driversStandingsQuery = useQuery({
      queryKey: ['driversStandings'],
      queryFn: getDriversStandings
   })

   const driversQuery = useQuery({
      queryKey: ['drivers'],
      queryFn: getDriversInfo
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
               {driversStandingsQuery.data?.map((standing) => {
                  const driver = driversQuery.data?.find(
                     (driver) => driver.driver_number === standing.driver_number,
                  )

                  if (!driver) return null

                  return (
                     <TableRow key={standing.driver_number}>
                        <TableCell className="text-center">{standing.position_current}</TableCell>
                        <TableCell className="text-center">{driver.name_acronym}</TableCell>
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