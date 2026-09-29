import { z } from "zod";

export const SessionResultSchema = z.array(
  z.object({
    dnf: z.boolean(),
    dns: z.boolean(),
    dsq: z.boolean(),
    driver_number: z.number().int(),
    duration: z.union([
      z.number(),
      z.array(z.number().nullable()),
    ]).nullable(),
    gap_to_leader: z.union([
      z.number(),
      z.string(),
      z.array(z.union([z.number(), z.string(), z.null()])),
    ]).nullable(),
    number_of_laps: z.number().int(),
    meeting_key: z.number().int(),
    position: z.number().int().nullable(),
    session_key: z.number().int(),
  }),
);
