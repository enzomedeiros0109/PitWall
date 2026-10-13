import type { OpenF1MeetingsSchema } from "@/schemas/openf1/meetings-schema"
import type { RaceSchema } from "@/schemas/jolpicaf1/sessions-schema"
import type { z } from "zod"

type Meeting = z.infer<typeof OpenF1MeetingsSchema>[number]
type Race = z.infer<typeof RaceSchema>

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function matchMeetingToRace(race: Race, meetings: Meeting[]): Meeting | undefined {
  const sameSeason = meetings.filter((meeting) => meeting.year === race.season)
  const raceLocation = normalize(race.location)
  const raceCircuit = normalize(race.circuit_short_name)
  const raceName = normalize(race.race_name)

  const sameRaceDate = sameSeason.filter((meeting) => {
    const startDate = meeting.date_start.slice(0, 10)
    const endDate = meeting.date_end.slice(0, 10)
    return race.date >= startDate && race.date <= endDate
  })
  const candidates = sameRaceDate.length > 0 ? sameRaceDate : sameSeason

  // Meeting names and venue labels vary across providers, so compare venue, date, and event name.
  const exactLocationMatch = candidates.find(
    (meeting) => normalize(meeting.location) === raceLocation,
  )
  if (exactLocationMatch) return exactLocationMatch

  const circuitMatch = candidates.find((meeting) => {
    const meetingCircuit = normalize(meeting.circuit_short_name)
    return meetingCircuit === raceCircuit ||
      meetingCircuit.includes(raceCircuit) ||
      raceCircuit.includes(meetingCircuit)
  })
  if (circuitMatch) return circuitMatch

  const dateAndCountryMatch = candidates.find(
    (meeting) => normalize(meeting.country_name) === normalize(race.country_name),
  )
  if (dateAndCountryMatch) return dateAndCountryMatch

  const eventNameMatch = candidates.find(
    (meeting) => normalize(meeting.meeting_name) === raceName,
  )
  if (eventNameMatch) return eventNameMatch

  if (sameRaceDate.length === 1) return sameRaceDate[0]

  const sameCountry = sameSeason.filter(
    (meeting) => normalize(meeting.country_name) === normalize(race.country_name),
  )
  return sameCountry.length === 1 ? sameCountry[0] : undefined
}
