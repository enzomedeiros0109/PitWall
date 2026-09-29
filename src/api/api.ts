import axios from 'axios';
import { SessionSchema } from '../schemas/sessions-schema';
import { DriversStandingsSchema } from '@/schemas/drivers-standings-schema';
import { DriverSchema } from '@/schemas/driver-schema';
import { TeamsStandingsSchema } from '@/schemas/teams-standings-schema';
import { SessionResultSchema } from '@/schemas/session-results-schema';

const api = axios.create({
   baseURL: 'https://api.openf1.org/v1/'
})

export async function getSessions() {
   const response = await api.get('sessions?session_name=Race&year=2026')

   return SessionSchema.parse(response.data)
}

export async function getLastestSessionsByCountry(country_name: string) {
   const response = await api.get(`sessions?country_name=${country_name}&year=2026`)

   return SessionSchema.parse(response.data)
}

export async function getSessionResult(sessionKey: number) {
   const response = await api.get(`session_result?session_key=${sessionKey}`)

   return SessionResultSchema.parse(response.data)
}

export async function getDriversStandings() {
   const response = await api.get(`championship_drivers?session_key=latest`)

   return DriversStandingsSchema.parse(response.data)
}

export async function getDriversInfo(sessionKey: number | "latest" = "latest") {
   const response = await api.get(`drivers?session_key=${sessionKey}`)

   return DriverSchema.parse(response.data)
}

export async function getTeamsStandings() {
   const response = await api.get('championship_teams?session_key=latest')

   return TeamsStandingsSchema.parse(response.data)
}