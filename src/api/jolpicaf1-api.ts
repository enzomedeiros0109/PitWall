import axios from 'axios';
import { SessionResultSchema } from '@/schemas/jolpicaf1/session-results-schema';
import { RacesSchema } from '@/schemas/jolpicaf1/sessions-schema';
import { JolpicaDriversSchema } from '@/schemas/jolpicaf1/drivers-schema';
import { DriverQualifyingResultsSchema, DriverRaceResultsSchema } from '@/schemas/jolpicaf1/driver-results-schema';

const api = axios.create({
   baseURL: 'https://api.jolpi.ca/ergast/f1/',
})

export async function getRaces(season = new Date().getFullYear()) {
   const response = await api.get(`${season}/races.json?limit=100`)
   return RacesSchema.parse(response.data)
}

export async function getRaceByRound(season: number, round: number) {
   const response = await api.get(`${season}/${round}/races.json`)
   return RacesSchema.parse(response.data)[0] ?? null
}

export async function getSeasonDrivers(season: number) {
   const response = await api.get(`${season}/drivers.json?limit=100`)
   return JolpicaDriversSchema.parse(response.data)
}

export async function getDriverRaceResults(season: number, driverId: string) {
   const response = await api.get(`${season}/drivers/${encodeURIComponent(driverId)}/results.json?limit=100`)
   return DriverRaceResultsSchema.parse(response.data).MRData.RaceTable.Races.flatMap((race) =>
      race.Results.filter((result) => result.Driver.driverId === driverId).map((result) => ({
         round: race.round,
         number: result.number,
         position: result.positionText ?? result.position,
         points: result.points,
         team_name: result.Constructor?.name ?? null,
         status: result.status,
      })),
   )
}

export async function getDriverQualifyingResults(season: number, driverId: string) {
   const response = await api.get(`${season}/drivers/${encodeURIComponent(driverId)}/qualifying.json?limit=100`)
   return DriverQualifyingResultsSchema.parse(response.data).MRData.RaceTable.Races.flatMap((race) =>
      race.QualifyingResults.filter((result) => result.Driver.driverId === driverId).map((result) => ({
         round: race.round,
         number: result.number,
         position: result.position ?? null,
         team_name: result.Constructor?.name ?? null,
      })),
   )
}

export async function getSessionResult(
   season: number,
   round: number,
   resultType: 'race' | 'sprint' | 'qualifying',
) {
   const endpoint = resultType === 'race' ? 'results' : resultType
   const response = await api.get(`${season}/${round}/${endpoint}.json`)
   return SessionResultSchema.parse(response.data)
}
