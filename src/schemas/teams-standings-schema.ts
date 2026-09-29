import { z } from "zod";

export const TeamsStandingsSchema = z.array(
  z.object({
    meeting_key: z.number().int(),
    points_current: z.number(),
    points_start: z.number(),
    position_current: z.number().int(),
    position_start: z.number().int(),
    session_key: z.number().int(),
    team_name: z.string(),
  }),
);
