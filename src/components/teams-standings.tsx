import { getDrivers, getTeamsStandings } from "@/api/openf1-api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { useQuery } from "@tanstack/react-query"

const TeamsStandings = () => {
   const teamsStandingsQuery = useQuery({
      queryKey: ['teamsStandings'],
      queryFn: () => getTeamsStandings(),
   })

   const drivers = useQuery({
      queryKey: ['drivers'],
      queryFn: () => getDrivers(),
   })
   const teamColorsByName = new Map(
      (drivers.data ?? []).map((driver) => [driver.team_name, driver.team_colour]),
   )


   return (
      <div className="bg-card rounded-xl self-start">
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead className="w-20 text-center">Position</TableHead>
                  <TableHead className="w-20 text-center">Team</TableHead>
                  <TableHead className="w-20 text-center">Points</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {teamsStandingsQuery.data?.map((team) => {
                  const teamColor = teamColorsByName.get(team.team_name)

                  return (
                     <TableRow key={team.team_name} className="h-12">
                        <TableCell
                           className="text-center"
                           style={{ color: team.position_current === 1 ? '#FFD700' : team.position_current === 2 ? '#C0C0C0' : team.position_current === 3 ? '#CD7F32' : '' }}
                        >
                           {team.position_current}
                        </TableCell>
                        <TableCell className="flex items-center gap-2 text-start">
                           <div
                              aria-hidden="true"
                              className="h-6 w-1 shrink-0"
                              style={{ backgroundColor: 1 ? `#${teamColor}` : "var(--muted-foreground)" }}
                           />
                           {team.team_name}
                        </TableCell>
                        <TableCell className="text-center">{team.points_current}</TableCell>
                     </TableRow>
                  )
               })}
            </TableBody>
         </Table>
      </div>
   )
}

export default TeamsStandings
