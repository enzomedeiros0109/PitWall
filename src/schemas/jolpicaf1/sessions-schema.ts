import { z } from "zod";

const JolpicaSessionDateSchema = z.object({
  date: z.string(),
  time: z.string().optional(),
});

const JolpicaRaceSchema = z.object({
  season: z.coerce.number().int(),
  round: z.coerce.number().int(),
  url: z.string().url().optional(),
  raceName: z.string(),
  date: z.string(),
  time: z.string().optional(),
  Circuit: z.object({
    circuitId: z.string(),
    url: z.string().url().optional(),
    circuitName: z.string(),
    Location: z.object({
      lat: z.string().optional(),
      long: z.string().optional(),
      locality: z.string(),
      country: z.string(),
    }).passthrough(),
  }).passthrough(),
  FirstPractice: JolpicaSessionDateSchema.optional(),
  SecondPractice: JolpicaSessionDateSchema.optional(),
  ThirdPractice: JolpicaSessionDateSchema.optional(),
  Qualifying: JolpicaSessionDateSchema.optional(),
  Sprint: JolpicaSessionDateSchema.optional(),
  SprintQualifying: JolpicaSessionDateSchema.optional(),
  SprintShootout: JolpicaSessionDateSchema.optional(),
}).passthrough();

export const SessionSchema = z.object({
  id: z.string(),
  season: z.number().int(),
  round: z.number().int(),
  session_name: z.string(),
  date: z.string(),
  time: z.string().nullable(),
  result_type: z.enum(["race", "sprint", "qualifying"]).nullable(),
});

export const RaceSchema = z.object({
  season: z.number().int(),
  round: z.number().int(),
  race_name: z.string(),
  date: z.string(),
  time: z.string().nullable(),
  country_name: z.string(),
  location: z.string(),
  circuit_id: z.string(),
  circuit_short_name: z.string(),
  sessions: z.array(SessionSchema),
});

const JolpicaRacesResponseSchema = z.object({
  MRData: z.object({
    xmlns: z.string().optional(),
    series: z.string().optional(),
    url: z.string().url().optional(),
    limit: z.coerce.number().int().optional(),
    offset: z.coerce.number().int().optional(),
    total: z.coerce.number().int().optional(),
    RaceTable: z.object({
      season: z.coerce.number().int().optional(),
      round: z.coerce.number().int().optional(),
      Races: z.array(JolpicaRaceSchema),
    }).passthrough(),
  }).passthrough(),
});

export const RacesSchema = JolpicaRacesResponseSchema.transform(({ MRData }) =>
  MRData.RaceTable.Races.map((race) => {
    const scheduledSessions = [
      { name: "Practice 1", schedule: race.FirstPractice, resultType: null },
      { name: "Practice 2", schedule: race.SecondPractice, resultType: null },
      { name: "Practice 3", schedule: race.ThirdPractice, resultType: null },
      {
        name: "Sprint Qualifying",
        schedule: race.SprintQualifying ?? race.SprintShootout,
        resultType: null,
      },
      { name: "Sprint", schedule: race.Sprint, resultType: "sprint" },
      { name: "Qualifying", schedule: race.Qualifying, resultType: "qualifying" },
      {
        name: "Race",
        schedule: { date: race.date, time: race.time },
        resultType: "race",
      },
    ].flatMap(({ name, schedule, resultType }) => {
      if (!schedule) return [];

      return [SessionSchema.parse({
        id: `${race.season}-${race.round}-${name}`,
        season: race.season,
        round: race.round,
        session_name: name,
        date: schedule.date,
        time: schedule.time ?? null,
        result_type: resultType,
      })];
    }).sort((a, b) => {
      const timeA = Date.parse(`${a.date}T${a.time ?? "23:59:59Z"}`);
      const timeB = Date.parse(`${b.date}T${b.time ?? "23:59:59Z"}`);
      return timeA - timeB;
    });

    return RaceSchema.parse({
      season: race.season,
      round: race.round,
      race_name: race.raceName,
      date: race.date,
      time: race.time ?? null,
      country_name: race.Circuit.Location.country,
      location: race.Circuit.Location.locality,
      circuit_id: race.Circuit.circuitId,
      circuit_short_name: race.Circuit.circuitName,
      sessions: scheduledSessions,
    });
  }),
);
