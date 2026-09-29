import { getTeamsStandings } from "@/api/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { useQuery } from "@tanstack/react-query"

type Props = {}

const TeamsStandings = ({ }: Props) => {

   const teamsStandingsQuery = useQuery({
      queryKey: ['teamsStandings'],
      queryFn: getTeamsStandings
   })


   return (
      <div className="bg-card rounded-xl self-start">
         <Table>
            <TableHeader>
               <TableRow >
                  <TableHead className="w-20 text-center">Position</TableHead>
                  <TableHead className="w-20 text-center">Team</TableHead>
                  <TableHead className="w-20 text-center">Points</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {teamsStandingsQuery.data?.map((team) => {
                  return (
                     <TableRow key={team.team_name} className="h-15">
                        <TableCell className="text-center">{team.position_current}</TableCell>
                        <TableCell className="text-center">{team.team_name}</TableCell>
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