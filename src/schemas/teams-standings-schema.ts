import { z } from "zod";

const JolpicaConstructorStandingSchema = z.object({
  position: z.string().optional(),
  positionText: z.string().optional(),
  points: z.string(),
  wins: z.string(),
  Constructor: z.object({
    constructorId: z.string(),
    name: z.string(),
  }),
});

export const TeamsStandingsSchema = z.object({
  MRData: z.object({
    StandingsTable: z.object({
      StandingsLists: z.array(z.object({
        ConstructorStandings: z.array(JolpicaConstructorStandingSchema),
      })),
    }),
  }),
}).transform(({ MRData }) =>
  MRData.StandingsTable.StandingsLists.flatMap((list) => list.ConstructorStandings).map((standing) => ({
    position: standing.positionText ?? standing.position ?? "-",
    points: Number(standing.points),
    wins: Number(standing.wins),
    team_id: standing.Constructor.constructorId,
    team_name: standing.Constructor.name,
  })),
);
