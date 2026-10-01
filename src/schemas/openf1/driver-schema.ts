import { z } from "zod";

export const OpenF1DriverSchema = z.array(
  z.object({
    broadcast_name: z.string(),
    driver_number: z.number().int(),
    first_name: z.string(),
    full_name: z.string(),
    headshot_url: z.string().url(),
    last_name: z.string(),
    meeting_key: z.number().int(),
    name_acronym: z.string(),
    session_key: z.number().int(),
    team_colour: z.string(),
    team_name: z.string(),
  })
);