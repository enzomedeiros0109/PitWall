import axios from 'axios';
import { SessionResultSchema } from '@/schemas/jolpicaf1/session-results-schema';
import { RacesSchema } from '@/schemas/jolpicaf1/sessions-schema';

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
