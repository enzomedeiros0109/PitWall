import { z } from "zod";

export const OpenF1SessionResultSchema = z.array(
  z.object({
    dnf: z.boolean(),
    dns: z.boolean(),
    dsq: z.boolean(),
    driver_number: z.number().int(),
    duration: z.number(),
    gap_to_leader: z.number(),
    number_of_laps: z.number().int(),
    meeting_key: z.number().int(),
    position: z.number().int(),
    session_key: z.number().int(),
  })
);