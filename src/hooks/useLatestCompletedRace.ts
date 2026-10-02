import { getAllSessions } from "@/api/openf1-api"
import { useQuery } from "@tanstack/react-query"

export function useLatestCompletedRace(year: number) {
   const sessionsQuery = useQuery({
      queryKey: ['sessions', year],
      queryFn: () => getAllSessions(year),
      enabled: Number.isInteger(year),
   })

   const now = Date.now()
   const latestCompletedRace = sessionsQuery.data
      ?.filter((session) =>
         session.session_type === 'Race' &&
         !session.is_cancelled &&
         Date.parse(session.date_end) <= now
      )
      .sort((a, b) => Date.parse(b.date_end) - Date.parse(a.date_end))[0]

   return {
      ...sessionsQuery,
      session: latestCompletedRace,
   }
}
