import { z } from "zod";

const JolpicaDriverStandingSchema = z.object({
  position: z.string().optional(),
  positionText: z.string().optional(),
  points: z.string(),
  wins: z.string(),
  Driver: z.object({
    driverId: z.string(),
    givenName: z.string(),
    familyName: z.string(),
    code: z.string().optional(),
  }),
  Constructors: z.array(z.object({ name: z.string() })).optional(),
});

export const DriversStandingsSchema = z.object({
  MRData: z.object({
    StandingsTable: z.object({
      StandingsLists: z.array(z.object({
        DriverStandings: z.array(JolpicaDriverStandingSchema),
      })),
    }),
  }),
}).transform(({ MRData }) =>
  MRData.StandingsTable.StandingsLists.flatMap((list) => list.DriverStandings).map((standing) => ({
    position: standing.positionText ?? standing.position ?? "-",
    points: Number(standing.points),
    wins: Number(standing.wins),
    driver_id: standing.Driver.driverId,
    driver_name: `${standing.Driver.givenName} ${standing.Driver.familyName}`,
    driver_code: standing.Driver.code ?? standing.Driver.driverId.slice(0, 3).toUpperCase(),
    team_name: standing.Constructors?.[0]?.name ?? "",
  })),
);
