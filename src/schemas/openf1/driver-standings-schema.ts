import { z } from "zod";

export const OpenF1DriverStandingSchema = z.array(
  z.object({
    driver_number: z.number().int(),
    meeting_key: z.number().int(),
    points_current: z.number(),
    points_start: z.number(),
    position_current: z.number().int(),
    position_start: z.number().int(),
    session_key: z.number().int(),
  })
);