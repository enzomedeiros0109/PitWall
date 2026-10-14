import { z } from "zod"

export const JolpicaDriversSchema = z.object({
  MRData: z.object({
    DriverTable: z.object({
      Drivers: z.array(z.object({
        driverId: z.string(),
        permanentNumber: z.string().optional(),
        code: z.string().optional(),
        url: z.string().url().optional(),
        givenName: z.string(),
        familyName: z.string(),
        dateOfBirth: z.string().optional(),
        nationality: z.string().optional(),
      })),
    }),
  }),
}).transform(({ MRData }) => MRData.DriverTable.Drivers)
