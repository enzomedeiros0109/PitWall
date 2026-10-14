import { getDriverQualifyingResults, getDriverRaceResults, getRaces, getSeasonDrivers } from "@/api/jolpicaf1-api"
import { getAllSessions, getDrivers, getDriversStandings, getMeetings } from "@/api/openf1-api"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { findDriverBySlug, getDriverSlug } from "@/lib/driver-slug"
import { matchMeetingToRace } from "@/lib/match-meeting"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router"
import { useState } from "react"

function formatRaceDate(date: string): string {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' })
    .format(new Date(`${date}T00:00:00Z`))
}

function formatStart(position: string | null | undefined, upcoming: boolean): string {
  if (!position) return upcoming ? 'Upcoming' : 'No result'
  return position
}

function formatFinish(position: string | undefined, status: string | undefined, upcoming: boolean): string {
  if (!position) return upcoming ? 'Upcoming' : 'No result'
  const normalizedStatus = status?.toLowerCase() ?? ''
  if (position === 'D' || normalizedStatus.includes('disqualified')) return 'DSQ'
  if (position === 'N' || normalizedStatus.includes('did not start')) return 'DNS'
  if (position === 'R' || normalizedStatus.includes('did not finish') || normalizedStatus.includes('retired')) return 'DNF'
  return position
}

const DriverPage = () => {
  const navigate = useNavigate()
  const { season: seasonParam, driverSlug } = useParams()
  const season = Number(seasonParam)
  const validSeason = Number.isSafeInteger(season) && season > 0
  const slug = driverSlug ?? ''
  const [now] = useState(() => Date.now())

  const jolpicaDriversQuery = useQuery({
    queryKey: ['jolpicaDrivers', season],
    queryFn: () => getSeasonDrivers(season),
    enabled: validSeason,
  })

  const racesQuery = useQuery({
    queryKey: ['races', season],
    queryFn: () => getRaces(season),
    enabled: validSeason,
  })

  const meetingsQuery = useQuery({
    queryKey: ['meetings', season],
    queryFn: () => getMeetings(season),
    enabled: validSeason,
  })

  const jolpicaDriver = findDriverBySlug(jolpicaDriversQuery.data ?? [], slug)
  const driverId = jolpicaDriver?.driverId

  const raceResultsQuery = useQuery({
    queryKey: ['driverRaceResults', season, driverId],
    queryFn: () => getDriverRaceResults(season, driverId!),
    enabled: Boolean(driverId),
  })

  const qualifyingResultsQuery = useQuery({
    queryKey: ['driverQualifyingResults', season, driverId],
    queryFn: () => getDriverQualifyingResults(season, driverId!),
    enabled: Boolean(driverId),
  })

  const seasonSessionsQuery = useQuery({
    queryKey: ['sessions', season],
    queryFn: () => getAllSessions(season),
    enabled: Boolean(driverId),
  })

  const latestCompletedRace = seasonSessionsQuery.data
    ?.filter((session) => session.session_type === 'Race' && !session.is_cancelled && Date.parse(session.date_end) <= now)
    .sort((a, b) => Date.parse(b.date_end) - Date.parse(a.date_end))[0]

  const standingsQuery = useQuery({
    queryKey: ['driversStandings', latestCompletedRace?.session_key],
    queryFn: () => getDriversStandings(latestCompletedRace!.session_key),
    enabled: latestCompletedRace !== undefined,
  })

  const latestRaceRound = raceResultsQuery.data?.slice().sort((a, b) => b.round - a.round)[0]?.round ?? 0
  const latestQualifyingRound = qualifyingResultsQuery.data?.slice().sort((a, b) => b.round - a.round)[0]?.round ?? 0
  const latestParticipatedRound = Math.max(latestRaceRound, latestQualifyingRound)
  const latestRaceDate = racesQuery.data?.find((race) => race.round === latestParticipatedRound)?.date
  const raceDate = latestRaceDate ? Date.parse(`${latestRaceDate}T00:00:00Z`) : null
  const startedSessions = (seasonSessionsQuery.data ?? [])
    .filter((session) => !session.is_cancelled && Date.parse(session.date_start) <= now)
    .sort((a, b) => Date.parse(b.date_start) - Date.parse(a.date_start))
  const selectedSession = raceDate === null
    ? startedSessions[0]
    : startedSessions.find((session) => Math.abs(Date.parse(session.date_start) - raceDate) < 4 * 24 * 60 * 60 * 1000)

  const openF1DriversQuery = useQuery({
    queryKey: ['drivers', selectedSession?.session_key],
    queryFn: () => getDrivers(String(selectedSession!.session_key)),
    enabled: Boolean(selectedSession) && !raceResultsQuery.isPending && !qualifyingResultsQuery.isPending,
  })

  const openF1Driver = openF1DriversQuery.data?.find((item) =>
    getDriverSlug(item.full_name) === slug ||
    (Boolean(jolpicaDriver?.code) && item.name_acronym.toLowerCase() === jolpicaDriver?.code?.toLowerCase()),
  )
  const driverNumber = openF1Driver?.driver_number ?? Number(jolpicaDriver?.permanentNumber)
  const standing = standingsQuery.data?.find((item) => item.driver_number === driverNumber)
  const teamColour = openF1Driver && /^[0-9a-f]{6}$/i.test(openF1Driver.team_colour)
    ? openF1Driver.team_colour
    : '000000'
  const races = racesQuery.data?.slice().sort((a, b) => a.round - b.round) ?? []

  return (
    <main className="relative isolate min-h-screen pb-10 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 scale-105 blur-3xl"
        style={{ background: `linear-gradient(45deg, #${teamColour} 0%, #000000 50%, #${teamColour} 100%)` }}
      />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-gray-950/35" />
      <div className="relative z-10">
        <div className="p-4">
          <Link to="/" className="flex w-fit items-center justify-center rounded-md bg-accent p-2 text-accent-foreground hover:bg-accent/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label="Back to home">
            <ArrowLeft className="size-8" aria-hidden="true" />
          </Link>
        </div>

        {!validSeason || !slug ? (
          <p role="alert" className="p-8">Invalid driver address.</p>
        ) : jolpicaDriversQuery.isPending ? (
          <p role="status" className="p-8">Loading driver…</p>
        ) : jolpicaDriversQuery.isError ? (
          <p role="alert" className="p-8">Could not load driver information.</p>
        ) : !jolpicaDriver ? (
          <p role="alert" className="p-8">Driver not found for this year.</p>
        ) : (
          <>
            <Card className="mx-60 bg-linear-to-r from-background/40 to-chart-5 text-white">
              <div className="flex flex-col gap-4 p-8">
                <div className="flex items-center gap-4">
                  {openF1Driver?.headshot_url && (
                    <img
                      src={openF1Driver.headshot_url}
                      alt={`Portrait of ${openF1Driver.full_name}`}
                      className="size-24 shrink-0 object-contain sm:size-28"
                    />
                  )}
                  <h1 className="text-3xl font-bold drop-shadow-lg sm:text-5xl">
                    {openF1Driver?.full_name ?? `${jolpicaDriver.givenName} ${jolpicaDriver.familyName}`}
                  </h1>
                </div>
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-8">
                  <h2
                    className="text-2xl font-semibold drop-shadow-lg sm:text-3xl"
                    style={{ color: `#${openF1Driver?.team_colour}` }}
                  >
                    {openF1Driver?.team_name ?? 'Team unavailable'}
                  </h2>
                  <p className="text-lg text-white/80 drop-shadow-lg sm:text-xl">
                    {jolpicaDriver.nationality ?? 'Nationality unavailable'} · Born {jolpicaDriver.dateOfBirth ? formatRaceDate(jolpicaDriver.dateOfBirth) : 'date unavailable'}
                  </p>
                </div>
                <p className="text-lg font-semibold drop-shadow-lg">
                  Championship position: {' '}
                  {standing ? (
                    <span style={{ color: standing.position_current === 1 ? '#FFD700' : standing.position_current === 2 ? '#C0C0C0' : standing.position_current === 3 ? '#CD7F32' : '' }}>
                      {standing.position_current}
                    </span>
                  ) : (
                    <span className="text-white/80">
                      {seasonSessionsQuery.isPending || (latestCompletedRace && standingsQuery.isPending) || (!jolpicaDriver.permanentNumber && openF1DriversQuery.isPending)
                        ? 'Loading…'
                        : seasonSessionsQuery.isError || standingsQuery.isError || (!Number.isFinite(driverNumber) && openF1DriversQuery.isError)
                          ? 'Unavailable'
                          : !latestCompletedRace
                            ? 'No standings yet'
                            : 'Unranked'}
                    </span>
                  )}
                </p>
                <p className="break-all">
                  {jolpicaDriver.url ? (
                    <a href={jolpicaDriver.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white/75">
                      {jolpicaDriver.url}
                    </a>
                  ) : 'Profile URL unavailable'}
                </p>
              </div>
            </Card>

            <section className="px-60 pt-10" aria-labelledby="season-results-heading">
              <h2 id="season-results-heading" className="mb-4 text-2xl font-semibold">{season} Grand Prix results</h2>
              {racesQuery.isPending ? (
                <p role="status">Loading races…</p>
              ) : racesQuery.isError ? (
                <p role="alert">Could not load the season schedule.</p>
              ) : races.length === 0 ? (
                <p>No races are scheduled for this year.</p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-white/30 bg-background/85 text-foreground backdrop-blur-sm">
                  <Table className="min-w-200 table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/4">Grand Prix</TableHead>
                        <TableHead className="w-1/8">Date</TableHead>
                        <TableHead className="w-1/4">Team</TableHead>
                        <TableHead className="w-1/8 text-center">Race Start</TableHead>
                        <TableHead className="w-1/8 text-center">Race Finish</TableHead>
                        <TableHead className="w-1/8 text-center">Pts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {races.map((race) => {
                        const raceResult = raceResultsQuery.data?.find((result) => result.round === race.round)
                        const qualifyingResult = qualifyingResultsQuery.data?.find((result) => result.round === race.round)
                        const upcoming = Date.parse(`${race.date}T${race.time ?? '23:59:59Z'}`) > now
                        const meeting = matchMeetingToRace(race, meetingsQuery.data ?? [])
                        const teamName = raceResult?.team_name ?? qualifyingResult?.team_name ?? '—'

                        return (
                          <TableRow key={race.round}>
                            <TableCell colSpan={6} className="p-0">
                              <button
                                type="button"
                                className="grid w-full grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,2fr)_repeat(3,minmax(0,1fr))] items-center text-left transform transition-all hover:bg-accent/80 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                                aria-label={`View ${race.race_name}`}
                                onClick={() => navigate(`/grand-prix/${season}/${race.round}`)}
                              >
                                <span className="flex min-w-0 items-center gap-3 p-2 font-medium">
                                  {meeting?.country_flag ? (
                                    <img src={meeting.country_flag} alt={`${race.country_name} flag`} className="size-8 shrink-0 object-scale-down" />
                                  ) : (
                                    <span aria-hidden="true" className="size-8 shrink-0 rounded-full bg-muted" />
                                  )}
                                  {race.race_name}
                                </span>
                                <span className="p-2">{formatShortDate(race.date)}</span>
                                <span className="p-2">{teamName}</span>
                                <span className="p-2 text-center">
                                  {qualifyingResultsQuery.isPending ? 'Loading…' : qualifyingResultsQuery.isError ? 'Unavailable' : formatStart(qualifyingResult?.position, upcoming)}
                                </span>
                                <span
                                  className="p-2 text-center"
                                  style={{ color: raceResult?.position === '1' ? '#FFD700' : raceResult?.position === '2' ? '#C0C0C0' : raceResult?.position === '3' ? '#CD7F32' : '' }}
                                >
                                  {raceResultsQuery.isPending ? 'Loading…' : raceResultsQuery.isError ? 'Unavailable' : formatFinish(raceResult?.position, raceResult?.status, upcoming)}
                                </span>
                                <span className="p-2 text-center">
                                  {raceResultsQuery.isPending ? 'Loading…' : raceResultsQuery.isError ? 'Unavailable' : raceResult?.points ?? '—'}
                                </span>
                              </button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}

export default DriverPage
