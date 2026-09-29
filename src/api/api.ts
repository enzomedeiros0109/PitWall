import axios from 'axios';
import { DriversStandingsSchema } from '@/schemas/drivers-standings-schema';
import { SessionResultSchema } from '@/schemas/session-results-schema';
import { RacesSchema } from '@/schemas/sessions-schema';
import { TeamsStandingsSchema } from '@/schemas/teams-standings-schema';

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

export async function getSessionResult(
   season: number,
   round: number,
   resultType: 'race' | 'sprint' | 'qualifying',
) {
   const endpoint = resultType === 'race' ? 'results' : resultType
   const response = await api.get(`${season}/${round}/${endpoint}.json`)
   return SessionResultSchema.parse(response.data)
}

export async function getDriversStandings() {
   const response = await api.get('current/driverstandings.json')
   return DriversStandingsSchema.parse(response.data)
}

export async function getTeamsStandings() {
   const response = await api.get('current/constructorstandings.json')
   return TeamsStandingsSchema.parse(response.data)
}
