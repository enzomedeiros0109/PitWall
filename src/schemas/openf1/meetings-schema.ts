import { z } from "zod";

export const OpenF1MeetingsSchema = z.array(
  z.object({
    circuit_key: z.number().int(),
    circuit_image: z.string().url(),
    circuit_info_url: z.string().url(),
    circuit_short_name: z.string(),
    circuit_type: z.enum(["Permanent", "Temporary - Street", "Temporary - Road"]),
    country_code: z.string(),
    country_flag: z.string().url(),
    country_key: z.number().int(),
    country_name: z.string(),
    date_end: z.string().datetime({ offset: true }),
    date_start: z.string().datetime({ offset: true }),
    gmt_offset: z.string(),
    is_cancelled: z.boolean(),
    location: z.string(),
    meeting_key: z.number().int(),
    meeting_name: z.string(),
    meeting_official_name: z.string(),
    year: z.number().int(),
  }),
);