import { getDrivers, getOpenF1SessionResult } from "@/api/openf1-api"
import type { OpenF1SessionResultSchema } from "@/schemas/openf1/session-result-schema"
import type { OpenF1SessionSchema } from "@/schemas/openf1/sessions-schema"
import { useQuery } from "@tanstack/react-query"
import type { z } from "zod"
import { ArrowDown, Calendar, MapPin } from "lucide-react"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"

type Session = z.infer<typeof OpenF1SessionSchema>[number]

type Props = {
   session: Session
   isPracticeResultsOpen?: boolean
   onPracticeResultsToggle?: () => void
}

function formatDate(isoString: string): string {
   return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
   }).format(new Date(isoString))
}

function getResultStatus(result: z.infer<typeof OpenF1SessionResultSchema>[number]): string {
   if (result.dsq) return 'DSQ'
   if (result.dns) return 'DNS'
   if (result.dnf) return 'DNF'
   return `P${result.position}`
}

const SessionCard = ({
   session,
   isPracticeResultsOpen = false,
   onPracticeResultsToggle,
}: Props) => {
   const isPractice = session.session_type.includes('Practice')

   // Load practice data only after the user opens its results.
   const sessionResult = useQuery({
      queryKey: ['sessionResult', session.session_key],
      queryFn: () => getOpenF1SessionResult(session.session_key),
      enabled: !session.is_cancelled && (!isPractice || isPracticeResultsOpen),
   })

   const drivers = useQuery({
      queryKey: ['drivers', session.session_key],
      queryFn: () => getDrivers(String(session.session_key)),
      enabled: !session.is_cancelled && (!isPractice || isPracticeResultsOpen),
   })

   const results = sessionResult.data
      ?.slice()
      .sort((a, b) => a.position - b.position)

   return (
      <Card
         className={`mx-auto w-full max-w-3xl transition-[gap] duration-300 ${isPractice && !isPracticeResultsOpen ? 'gap-0' : ''}`}
         style={{ paddingBottom: isPractice && !isPracticeResultsOpen ? 'var(--card-spacing)' : undefined }}
      >
         <CardHeader>
            <CardTitle className="text-2xl">{session.session_name}</CardTitle>
            {isPractice && (
               <CardAction>
                  <button
                     type="button"
                     className="rounded-md p-2 hover:bg-accent"
                     aria-label={`${isPracticeResultsOpen ? 'Hide' : 'Show'} ${session.session_name} results`}
                     aria-expanded={isPracticeResultsOpen}
                     onClick={onPracticeResultsToggle}
                  >
                     <ArrowDown
                        className={`size-5 transition-transform ${isPracticeResultsOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                     />
                  </button>
               </CardAction>
            )}
            <CardDescription className="flex flex-col gap-2">
               <span className="flex items-center gap-2">
                  <Calendar className="size-5" aria-hidden="true" />
                  {formatDate(session.date_start)}
               </span>
               <span className="flex items-center gap-2">
                  <MapPin className="size-5" aria-hidden="true" />
                  {session.country_name}, {session.location}
               </span>
               {session.is_cancelled && (
                  <span className="font-semibold text-red-500">Cancelled</span>
               )}
            </CardDescription>
         </CardHeader>

         <div
            aria-hidden={isPractice && !isPracticeResultsOpen}
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${!isPractice || isPracticeResultsOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
         >
            <div className="min-h-0 overflow-hidden">
               <CardFooter className="w-full flex-col items-stretch gap-2">
                  {session.is_cancelled && <p>Results are unavailable for a cancelled session.</p>}
                  {!session.is_cancelled && sessionResult.isPending && <p>Loading results…</p>}
                  {!session.is_cancelled && sessionResult.isError && (
                     <p role="alert">Could not load this session&apos;s results.</p>
                  )}
                  {!session.is_cancelled && sessionResult.isSuccess && results?.length === 0 && (
                     <p>No results available for this session.</p>
                  )}
                  {!session.is_cancelled && sessionResult.isSuccess && Boolean(results?.length) && (
                     // Keep the labels aligned with the result rows below.
                     <div className="grid grid-cols-[3rem_minmax(0,1fr)_auto_auto] items-center gap-3 border-b py-2 text-sm font-semibold text-muted-foreground">
                        <p className="text-center">Position</p>
                        <p className="border-l-2 border-transparent pl-3">Name</p>
                        <p className="text-right">Laps</p>
                        <p className="text-right">Gap</p>
                     </div>
                  )}
                  {results?.map((result) => {
                     const driver = drivers.data?.find(
                        (item) => item.driver_number === result.driver_number,
                     )
                     const status = getResultStatus(result)

                     return (
                        <div
                           key={`${result.session_key}-${result.driver_number}`}
                           className="grid grid-cols-[3rem_minmax(0,1fr)_auto_auto] items-center gap-3 border-b py-2 last:border-b-0"
                        >
                           <p className="text-center">{status}</p>
                           <p
                              className="border-l-2 pl-3"
                              style={{
                                 borderColor: driver?.team_colour
                                    ? `#${driver.team_colour}`
                                    : undefined,
                              }}
                           >
                              {driver?.broadcast_name ?? `Driver ${result.driver_number}`}
                           </p>
                           <p className="whitespace-nowrap text-right">
                              {result.number_of_laps} laps
                           </p>
                           <p className="text-right">
                              +{result.gap_to_leader}
                           </p>
                        </div>
                     )
                  })}
               </CardFooter>
            </div>
         </div>
      </Card>
   )
}

export default SessionCard
