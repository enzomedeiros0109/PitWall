import { OpenF1DriverSchema } from "@/schemas/openf1/driver-schema";
import { OpenF1DriverStandingSchema } from "@/schemas/openf1/driver-standings-schema";
import { OpenF1SessionResultSchema } from "@/schemas/openf1/session-result-schema";
import { OpenF1SessionSchema } from "@/schemas/openf1/sessions-schema";
import { OpenF1TeamsStandingsSchema } from "@/schemas/openf1/teams-standings-schema";
import axios from "axios";

const api = axios.create({
   baseURL: 'https://api.openf1.org/v1/',
})

const requestStarts: number[] = []
const PER_SECOND_LIMIT = 3
const PER_MINUTE_LIMIT = 30
const SECOND_WINDOW_MS = 1_000
const MINUTE_WINDOW_MS = 60_000
const MIN_REQUEST_INTERVAL_MS = 334
const DEFAULT_RATE_LIMIT_COOLDOWN_MS = 60_000
let nextRequestAt = 0
let blockedUntil = 0

// Keep every OpenF1 request inside both rolling request windows.
async function waitForRequestSlot() {
   while (true) {
      const now = Date.now()
      while (requestStarts.length && now - requestStarts[0] >= MINUTE_WINDOW_MS) {
         requestStarts.shift()
      }

      const secondWindow = requestStarts.filter((startedAt) => now - startedAt < SECOND_WINDOW_MS)
      const minuteWindow = requestStarts

      if (secondWindow.length < PER_SECOND_LIMIT && minuteWindow.length < PER_MINUTE_LIMIT) {
         const wait = Math.max(nextRequestAt - now, blockedUntil - now)
         if (wait <= 0) {
            requestStarts.push(now)
            nextRequestAt = now + MIN_REQUEST_INTERVAL_MS
            return
         }
      }

      const secondWait = secondWindow.length >= PER_SECOND_LIMIT
         ? SECOND_WINDOW_MS - (now - secondWindow[0])
         : 0
      const minuteWait = minuteWindow.length >= PER_MINUTE_LIMIT
         ? MINUTE_WINDOW_MS - (now - minuteWindow[0])
         : 0
      const pacingWait = Math.max(nextRequestAt - now, blockedUntil - now, 0)

      await new Promise((resolve) => setTimeout(
         resolve,
         Math.max(secondWait, minuteWait, pacingWait, 1),
      ))
   }
}

api.interceptors.request.use(async (config) => {
   await waitForRequestSlot()
   return config
})

api.interceptors.response.use(
   (response) => response,
   (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
         const cooldown = getOpenF1RetryDelay(error) ?? DEFAULT_RATE_LIMIT_COOLDOWN_MS
         blockedUntil = Math.max(blockedUntil, Date.now() + cooldown)
      }

      return Promise.reject(error)
   },
)

export function getOpenF1RetryDelay(error: unknown) {
   if (!axios.isAxiosError(error) || error.response?.status !== 429) return undefined

   const retryAfter = String(error.response.headers['retry-after'] ?? '').trim()
   const retryAfterSeconds = Number(retryAfter)
   const retryAfterDate = Date.parse(retryAfter)

   if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
      return retryAfterSeconds * 1_000
   }
   if (Number.isFinite(retryAfterDate) && retryAfterDate > Date.now()) {
      return retryAfterDate - Date.now()
   }
   return DEFAULT_RATE_LIMIT_COOLDOWN_MS
}

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
