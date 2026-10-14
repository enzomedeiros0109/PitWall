import { z } from "zod";

export const OpenF1SessionResultSchema = z.array(
  z.object({
    dnf: z.boolean(),
    dns: z.boolean(),
    dsq: z.boolean(),
    driver_number: z.number().int(),
    duration: z.union([z.number(), z.array(z.number().nullable())]).nullable(),
    gap_to_leader: z.union([
      z.number(),
      z.string(),
      z.array(z.union([z.number(), z.string(), z.null()])),
    ]).nullable(),
    number_of_laps: z.number().int(),
    meeting_key: z.number().int(),
    position: z.union([z.number().int(), z.string().trim().min(1)]).nullable().transform((position) => {
      if (typeof position !== "string" || !/^\d+$/.test(position)) return position;

      const numericPosition = Number(position);
      return Number.isSafeInteger(numericPosition) ? numericPosition : position;
    }),
    session_key: z.number().int(),
  })
);
