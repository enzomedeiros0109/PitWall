import { z } from "zod"

const DriverReferenceSchema = z.object({
  driverId: z.string(),
})

export const DriverRaceResultsSchema = z.object({
  MRData: z.object({
    RaceTable: z.object({
      Races: z.array(z.object({
        round: z.coerce.number().int(),
        Results: z.array(z.object({
          number: z.string(),
          position: z.string(),
          positionText: z.string().optional(),
          points: z.string(),
          status: z.string().optional(),
          Driver: DriverReferenceSchema,
          Constructor: z.object({ name: z.string() }).optional(),
        })),
      })),
    }),
  }),
})

export const DriverQualifyingResultsSchema = z.object({
  MRData: z.object({
    RaceTable: z.object({
      Races: z.array(z.object({
        round: z.coerce.number().int(),
        QualifyingResults: z.array(z.object({
          number: z.string(),
          position: z.string().optional(),
          Driver: DriverReferenceSchema,
          Constructor: z.object({ name: z.string() }).optional(),
        })),
      })),
    }),
  }),
})
