import { z } from "zod";

export const OpenF1SessionSchema = z.array(
  z.object({
    circuit_key: z.number().int(),
    circuit_short_name: z.string(),
    country_code: z.string(),
    country_key: z.number().int(),
    country_name: z.string(),
    date_end: z.string().datetime({ offset: true }),
    date_start: z.string().datetime({ offset: true }),
    gmt_offset: z.string(),
    is_cancelled: z.boolean(),
    location: z.string(),
    meeting_key: z.number().int(),
    session_key: z.number().int(),
    session_name: z.string(),
    session_type: z.string(),
    year: z.number().int(),
  })
);