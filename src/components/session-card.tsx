import { getDrivers, getOpenF1SessionResult } from "@/api/openf1-api"
import type { OpenF1SessionResultSchema } from "@/schemas/openf1/session-result-schema"
import type { OpenF1SessionSchema } from "@/schemas/openf1/sessions-schema"
import { useQuery } from "@tanstack/react-query"
import { ZodError, type z } from "zod"
import { ArrowDown, Calendar } from "lucide-react"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"

type Session = z.infer<typeof OpenF1SessionSchema>[number]

type Props = {
   session: Session
   sessionHasStarted: boolean
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
   return result.position === null ? '—' : `P${result.position}`
}

function formatGap(gap: z.infer<typeof OpenF1SessionResultSchema>[number]['gap_to_leader']): string {
   if (gap === null) return '—'
   if (typeof gap === 'number' || typeof gap === 'string') return String(gap)

   return gap
      .map((value, index) => `Q${index + 1} ${value === null ? '—' : value}`)
      .join(' · ')
}

function formatLapTime(seconds: number | null): string {
   if (seconds === null) return '—'

   const minutes = Math.floor(seconds / 60)
   const remainingSeconds = (seconds % 60).toFixed(3).padStart(6, '0')
   return `${minutes}:${remainingSeconds}`
}

function getSessionResultError(error: unknown): string {
   if (error instanceof ZodError) {
      const issue = error.issues[0]
      return `Invalid response data${issue ? ` at ${issue.path.join('.') || 'result'}: ${issue.message}` : ''}`
   }

   if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = error.response
      if (typeof response === 'object' && response !== null && 'status' in response) {
         return `OpenF1 returned HTTP ${String(response.status)}`
      }
   }

   return error instanceof Error ? error.message : 'Unknown request error'
}

const SessionCard = ({
   session,
   sessionHasStarted,
   isPracticeResultsOpen = false,
   onPracticeResultsToggle,
}: Props) => {
   const isPractice = session.session_type.includes('Practice')
   const isQualifying = session.session_type.includes('Qualifying')

   // Load practice data only after the user opens its results.
   const sessionResult = useQuery({
      queryKey: ['sessionResult', session.session_key, 'flexible-result-fields-v2'],
      queryFn: () => getOpenF1SessionResult(session.session_key),
      enabled: !session.is_cancelled && sessionHasStarted && (!isPractice || isPracticeResultsOpen),
   })

   const drivers = useQuery({
      queryKey: ['drivers', session.session_key],
      queryFn: () => getDrivers(String(session.session_key)),
      enabled: !session.is_cancelled && sessionHasStarted && (!isPractice || isPracticeResultsOpen),
   })

   const results = sessionResult.data
      ?.slice()
      .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity))

   // Keep result cards consistent with the translucent schedule cards.
   return (
      <Card
         className={`mx-auto w-full max-w-3xl bg-background/85 backdrop-blur-sm transition-[gap] duration-300 ${isPractice && !isPracticeResultsOpen ? 'gap-0' : ''}`}
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
                  {!session.is_cancelled && !sessionHasStarted && <p>Results are not available yet.</p>}
                  {!session.is_cancelled && sessionHasStarted && sessionResult.isPending && <p>Loading results…</p>}
                  {!session.is_cancelled && sessionResult.isError && (
                     <p role="alert">
                        Could not load this session&apos;s results ({getSessionResultError(sessionResult.error)}).
                     </p>
                  )}
                  {!session.is_cancelled && sessionResult.isSuccess && results?.length === 0 && (
                     <p>No results available for this session.</p>
                  )}
                  {!session.is_cancelled && sessionResult.isSuccess && Boolean(results?.length) && (
                     <div className={`grid ${isQualifying ? 'grid-cols-[3rem_minmax(0,1fr)_repeat(3,minmax(4rem,auto))]' : 'grid-cols-[3rem_minmax(0,1fr)_auto_auto]'} items-center gap-3 border-b py-2 text-sm font-semibold text-muted-foreground`}>
                        <p className="text-center">Position</p>
                        <p className="border-l-2 border-transparent pl-3">Name</p>
                        {isQualifying ? (
                           <>
                              <p className="text-center">Q1</p>
                              <p className="text-center">Q2</p>
                              <p className="text-center">Q3</p>
                           </>
                        ) : (
                           <>
                              <p className="text-right">Laps</p>
                              <p className="text-right">Gap</p>
                           </>
                        )}
                     </div>
                  )}
                  {results?.map((result) => {
                     const driver = drivers.data?.find(
                        (item) => item.driver_number === result.driver_number,
                     )
                     const status = getResultStatus(result)
                     const qualifyingTimes = Array.isArray(result.duration) ? result.duration : []

                     return (
                        <div
                           key={`${result.session_key}-${result.driver_number}`}
                           className={`grid ${isQualifying ? 'grid-cols-[3rem_minmax(0,1fr)_repeat(3,minmax(4rem,auto))]' : 'grid-cols-[3rem_minmax(0,1fr)_auto_auto]'} items-center gap-3 border-b py-2 last:border-b-0`}
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
                           {isQualifying ? (
                              Array.from({ length: 3 }, (_, index) => (
                                 <p key={index} className="whitespace-nowrap text-right">
                                    {formatLapTime(qualifyingTimes[index] ?? null)}
                                 </p>
                              ))
                           ) : (
                              <>
                                 <p className="whitespace-nowrap text-right">
                                    {result.number_of_laps} laps
                                 </p>
                                 <p className="text-right">
                                    {typeof result.gap_to_leader === 'number' ? '+' : ''}
                                    {formatGap(result.gap_to_leader)}
                                 </p>
                              </>
                           )}
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
