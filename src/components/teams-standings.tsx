import { getTeamsStandings } from "@/api/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { useQuery } from "@tanstack/react-query"

const TeamsStandings = () => {
   const teamsStandingsQuery = useQuery({
      queryKey: ['teamsStandings'],
      queryFn: getTeamsStandings,
   })

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
               {teamsStandingsQuery.data?.map((team) => (
                  <TableRow key={team.team_id} className="h-15">
                     <TableCell className="text-center">{team.position}</TableCell>
                     <TableCell className="text-center">{team.team_name}</TableCell>
                     <TableCell className="text-center">{team.points}</TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   )
}

export default TeamsStandings
