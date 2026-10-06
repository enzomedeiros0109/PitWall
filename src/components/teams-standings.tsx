import { getDrivers, getTeamsStandings } from "@/api/openf1-api"
import { useLatestCompletedRace } from "@/hooks/useLatestCompletedRace"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { useQuery } from "@tanstack/react-query"

type TeamsStandingsProps = {
   year: number
}

const TeamsStandings = ({ year }: TeamsStandingsProps) => {
   const raceQuery = useLatestCompletedRace(year)
   const raceSessionKey = raceQuery.session?.session_key

   const teamsStandingsQuery = useQuery({
      queryKey: ['teamsStandings', raceSessionKey],
      queryFn: () => getTeamsStandings(raceSessionKey!),
      enabled: raceSessionKey !== undefined,
   })

   const drivers = useQuery({
      queryKey: ['drivers'],
      queryFn: () => getDrivers(),
   })
   const teamColorsByName = new Map(
      (drivers.data ?? []).map((driver) => [driver.team_name, driver.team_colour]),
   )


   return (
      <div className="self-start overflow-hidden rounded-xl bg-background/85 backdrop-blur-sm border border-white/50">
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead className="w-20 text-center">Position</TableHead>
                  <TableHead className="w-20 text-center">Team</TableHead>
                  <TableHead className="w-20 text-center">Points</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {(raceQuery.isPending || (raceSessionKey !== undefined && teamsStandingsQuery.isPending)) && (
                  <TableRow>
                     <TableCell colSpan={3} className="text-center">Loading team standings…</TableCell>
                  </TableRow>
               )}
               {(raceQuery.isError || teamsStandingsQuery.isError) && (
                  <TableRow>
                     <TableCell colSpan={3} className="text-center">Could not load team standings.</TableCell>
                  </TableRow>
               )}
               {raceQuery.isSuccess && !raceQuery.session && (
                  <TableRow>
                     <TableCell colSpan={3} className="text-center">No completed race this season yet.</TableCell>
                  </TableRow>
               )}
               {teamsStandingsQuery.data?.map((team) => {
                  const teamColor = teamColorsByName.get(team.team_name)

                  return (
                     <TableRow key={team.team_name} className="h-12">
                        <TableCell
                           className="text-center font-bold"
                           style={{ color: team.position_current === 1 ? '#FFD700' : team.position_current === 2 ? '#C0C0C0' : team.position_current === 3 ? '#CD7F32' : '' }}
                        >
                           {team.position_current}
                        </TableCell>
                        <TableCell className="flex items-center gap-2 text-start">
                           <div
                              aria-hidden="true"
                              className="h-6 w-0.5 shrink-0"
                              style={{ backgroundColor: teamColor ? `#${teamColor}` : "var(--muted-foreground)" }}
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
