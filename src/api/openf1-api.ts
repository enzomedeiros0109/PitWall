import { OpenF1DriverSchema } from "@/schemas/openf1/driver-schema";
import { OpenF1DriverStandingSchema } from "@/schemas/openf1/driver-standings-schema";
import { OpenF1SessionResultSchema } from "@/schemas/openf1/session-result-schema";
import { OpenF1SessionSchema } from "@/schemas/openf1/sessions-schema";
import { OpenF1TeamsStandingsSchema } from "@/schemas/openf1/teams-standings-schema";
import axios from "axios";

const api = axios.create({
   baseURL: 'https://api.openf1.org/v1/',
})

export async function getDrivers(session_key = 'latest') {
   const response = await api.get(`drivers?session_key=${session_key}`)

   return OpenF1DriverSchema.parse(response.data)
}

export async function getDriversStandings(session_key: number) {
   const response = await api.get(`championship_drivers?session_key=${session_key}`)

   return OpenF1DriverStandingSchema.parse(response.data)
}

export async function getTeamsStandings(session_key: number){
   const response = await api.get(`championship_teams?session_key=${session_key}`)

   return OpenF1TeamsStandingsSchema.parse(response.data)
}

function getSessionsParams(year: number, country_name?: string, session_name?: string) {
   const params = new URLSearchParams({ year: String(year) })
   if (country_name) params.set('country_name', country_name)
   if (session_name) params.set('session_name', session_name)
   return params.toString()
}

export async function getPracticeSessions(country_name: string, year: number) {
   const response = await api.get(`sessions?${getSessionsParams(year, country_name, 'Practice')}`)

   // Retorna apenas sessões de treino
   return OpenF1SessionSchema.parse(response.data)
}

export async function getRaceAndQualySessions(country_name: string, year: number) {
   const response = await api.get(`sessions?${getSessionsParams(year, country_name)}`)

   // Retorna sessões de corrida e qualificação
   return OpenF1SessionSchema.parse(response.data).filter((session) => !(session.session_type.includes('Practice')))
}

export async function getAllSessions(year: number, country_name?: string) {
   const response = await api.get(`sessions?${getSessionsParams(year, country_name)}`)

   // Retorna todas as sessões
   return OpenF1SessionSchema.parse(response.data)
}

export async function getOpenF1SessionResult(session_key: number) {
   const response = await api.get(`session_result?session_key=${session_key}`)

   return OpenF1SessionResultSchema.parse(response.data)
}
