import { z } from "zod";

export const idSchema = z.string().min(3);
export const isoDateSchema = z.string().datetime();
