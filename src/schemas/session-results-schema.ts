import { z } from "zod";

const JolpicaResultSchema = z.object({
  position: z.string(),
  positionText: z.string().optional(),
  Driver: z.object({
    driverId: z.string(),
    givenName: z.string(),
    familyName: z.string(),
    code: z.string().optional(),
  }),
  Constructor: z.object({ name: z.string() }).optional(),
});

const JolpicaRaceResultsSchema = z.object({
  Results: z.array(JolpicaResultSchema).optional(),
  SprintResults: z.array(JolpicaResultSchema).optional(),
  QualifyingResults: z.array(JolpicaResultSchema).optional(),
}).passthrough();

export const SessionResultSchema = z.object({
  MRData: z.object({
    RaceTable: z.object({
      Races: z.array(JolpicaRaceResultsSchema),
    }),
  }),
}).transform(({ MRData }) =>
  MRData.RaceTable.Races.flatMap((race) =>
    race.Results ?? race.SprintResults ?? race.QualifyingResults ?? [],
  ).map((result) => ({
    driver_id: result.Driver.driverId,
    driver_name: `${result.Driver.givenName} ${result.Driver.familyName}`,
    driver_code: result.Driver.code ?? result.Driver.driverId.slice(0, 3).toUpperCase(),
    constructor_name: result.Constructor?.name ?? "",
    position: result.positionText ?? result.position,
  })),
);
