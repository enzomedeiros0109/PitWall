import { getDriversInfo, getDriversStandings } from "@/api/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { useQuery } from "@tanstack/react-query"

type Props = {}

const DriversStandings = ({ }: Props) => {

   const driversStandingsQuery = useQuery({
      queryKey: ['driversStandings'],
      queryFn: getDriversStandings,
      staleTime: 60_000,
      retry: (failureCount, error) => {
         const status = (error as { response?: { status?: number } }).response?.status
         return status !== 429 && failureCount < 2
      },
   })

   const driversQuery = useQuery({
      queryKey: ['drivers'],
      queryFn: getDriversInfo,
      staleTime: 60_000,
      retry: (failureCount, error) => {
         const status = (error as { response?: { status?: number } }).response?.status
         return status !== 429 && failureCount < 2
      },
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
               {(driversStandingsQuery.isPending || driversQuery.isPending) && (
                  <TableRow>
                     <TableCell colSpan={3} className="text-center">Loading driver standings…</TableCell>
                  </TableRow>
               )}
               {(driversStandingsQuery.isError || driversQuery.isError) && (
                  <TableRow>
                     <TableCell colSpan={3} className="text-center">Could not load driver standings. The API may be rate limited.</TableCell>
                  </TableRow>
               )}
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