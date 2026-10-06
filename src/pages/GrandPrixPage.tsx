import { getRaceByRound } from "@/api/jolpicaf1-api"
import { getAllSessions, getMeetings } from "@/api/openf1-api"
import SessionCard from "@/components/session-card"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, LoaderCircle } from "lucide-react"
import { useNavigate, useParams } from "react-router"
import { formatDate } from "@/hooks/formatDate"
import { getSessionImage } from "@/data/session-images"
import { matchMeetingToRace } from "@/data/match-meeting"

function getScheduledStart(date: string, time: string | null): number {
  return Date.parse(`${date}T${time ?? '23:59:59Z'}`)
}

function formatScheduledDate(date: string, time: string | null): string {
  const options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
  if (time) options.timeStyle = 'short'

  return new Intl.DateTimeFormat('pt-BR', options).format(
    new Date(`${date}T${time ?? '00:00:00Z'}`),
  )
}

const GrandPrixPage = () => {
  const [expandedPracticeSessionKey, setExpandedPracticeSessionKey] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const navigate = useNavigate()
  const { season: seasonParam, round: roundParam } = useParams()
  const season = Number(seasonParam)
  const round = Number(roundParam)

  // Keep the schedule view in sync when a session starts while the page is open.
  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(intervalId)
  }, [])

  const raceQuery = useQuery({
    queryKey: ['grandPrix', season, round],
    queryFn: () => getRaceByRound(season, round),
    enabled: Number.isInteger(season) && Number.isInteger(round),
  })

  const meetingsQuery = useQuery({
    queryKey: ['meetings', season],
    queryFn: () => getMeetings(season),
    enabled: Number.isInteger(season),
  })

  const country_name = raceQuery.data?.country_name

  const sessionsQuery = useQuery({
    queryKey: ['sessions', season, country_name],
    queryFn: () => getAllSessions(season, country_name!),
    enabled: Boolean(country_name),
  })

  const sessions = sessionsQuery.data ?? []
  const scheduledSessions = raceQuery.data?.sessions ?? []
  const meeting = raceQuery.data
    ? matchMeetingToRace(raceQuery.data, meetingsQuery.data ?? [])
    : undefined
  const selectedRaceSessions = sessions.filter((session) =>
    session.year === season &&
    session.location.toLowerCase() === raceQuery.data?.location.toLowerCase()
  )
  const backgroundImage = raceQuery.data
    ? getSessionImage(raceQuery.data.circuit_short_name, raceQuery.data.location)
    : undefined
  const hasAnySessionStarted = scheduledSessions.some(
    (session) => getScheduledStart(session.date, session.time) <= now,
  )

  const renderStartedSession = (scheduledSession: (typeof scheduledSessions)[number]) => {
    const openF1Session = selectedRaceSessions.find(
      (session) => session.session_name.toLowerCase() === scheduledSession.session_name.toLowerCase(),
    )
    const sessionStart = openF1Session
      ? Date.parse(openF1Session.date_start)
      : getScheduledStart(scheduledSession.date, scheduledSession.time)
    const sessionHasStarted = sessionStart <= now

    if (!openF1Session) {
      return (
        <Card key={scheduledSession.id} className="w-full max-w-3xl bg-background/85 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>{scheduledSession.session_name}</CardTitle>
            <CardDescription>{formatScheduledDate(scheduledSession.date, scheduledSession.time)}</CardDescription>
            <p className="pt-2 text-sm text-muted-foreground">
              {sessionHasStarted ? 'Session results are not available.' : 'Results are not available yet.'}
            </p>
          </CardHeader>
        </Card>
      )
    }

    const isPractice = openF1Session.session_type.includes('Practice')
    return (
      <SessionCard
        key={openF1Session.session_key}
        session={openF1Session}
        sessionHasStarted={sessionHasStarted}
        isPracticeResultsOpen={expandedPracticeSessionKey === openF1Session.session_key}
        onPracticeResultsToggle={isPractice ? () =>
          setExpandedPracticeSessionKey((current) =>
            current === openF1Session.session_key ? null : openF1Session.session_key,
          ) : undefined}
      />
    )
  }

  if (raceQuery.isPending || meetingsQuery.isPending || (Boolean(country_name) && sessionsQuery.isPending)) {
    return (
      <div className="relative isolate flex min-h-screen flex-col items-center justify-center gap-8">
        {backgroundImage && (
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 scale-105 bg-cover bg-center bg-no-repeat blur-sm"
            style={{ backgroundImage: `url("${backgroundImage}")` }}
          />
        )}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-black/55" />
        <div className="relative z-10 flex flex-col items-center gap-8 text-white">
          <LoaderCircle className="size-10 animate-spin" aria-hidden="true" />
          <p role="status" className="text-2xl">Loading data...</p>
        </div>
      </div>
    )
  }

  if (!raceQuery.data) {
    return <p role="alert" className="p-8">Grand Prix schedule not found.</p>
  }

  return (
    <div className="relative isolate min-h-screen">
      {backgroundImage && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${backgroundImage}")` }}
        />
      )}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-black/45" />
      <div className="relative z-10">
      <div className="p-4">
        <button
          className="flex items-center justify-center p-2 bg-accent rounded-md cursor-pointer hover:bg-accent-foreground/20"
          onClick={() => {
            navigate(`/`)
          }}
        >
          <ArrowLeft className="size-8" />
        </button>
      </div>

      <Card className="mx-4 bg-linear-to-r from-background/40 to-chart-5 sm:mx-24">
        {meeting ? (
          <div className="flex flex-col gap-4 p-8">
            <div className="flex flex-col gap-4 items-start">
              <img
                src={meeting.country_flag}
                alt={`${meeting.country_name} flag`}
                className="h-8 w-12 rounded-sm object-cover shadow"
              />
              <h1 className="text-3xl font-bold text-white drop-shadow-lg sm:text-5xl">
                {meeting.meeting_official_name}
              </h1>
            </div>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-8">
              <h2 className="text-2xl font-semibold text-white drop-shadow-lg sm:text-3xl">
                {meeting.country_name}, {meeting.location}
              </h2>
              <h2 className="text-lg text-white/80 drop-shadow-lg sm:text-xl">
                {formatDate(meeting.date_start)} - {formatDate(meeting.date_end)}
              </h2>
            </div>
          </div>
        ) : (
          <p role="alert" className="p-8 text-white">
            OpenF1 meeting information is unavailable for this Grand Prix.
          </p>
        )}
      </Card>

      {hasAnySessionStarted ? (
        <>
          <div className="mx-4 grid grid-cols-[repeat(auto-fit,minmax(min(100%,24rem),1fr))] items-start justify-items-center gap-4 p-4 sm:mx-24">
            {scheduledSessions
              .filter((session) => !session.session_name.toLowerCase().includes('practice'))
              .map(renderStartedSession)}
          </div>
          <div className="mx-4 grid grid-cols-[repeat(auto-fit,minmax(min(100%,24rem),1fr))] items-start justify-items-center gap-4 p-4 pt-0 sm:mx-24">
            {scheduledSessions
              .filter((session) => session.session_name.toLowerCase().includes('practice'))
              .map(renderStartedSession)}
          </div>
        </>
      ) : (
        <div className="mx-4 grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] justify-items-center gap-4 p-4 sm:mx-24">
          {scheduledSessions.map((session) => (
            <Card key={session.id} className="w-full max-w-sm bg-background/85 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{session.session_name}</CardTitle>
                <CardDescription>{formatScheduledDate(session.date, session.time)}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}


      </div>
    </div>
  )
}

export default GrandPrixPage
