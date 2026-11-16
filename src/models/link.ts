import { z } from 'zod'

const expiresAt = z.iso
  .datetime()
  .refine((value) => new Date(value).getTime() > Date.now(), {
    message: 'expiresAt deve ser uma data no futuro',
  })
  .transform((value) => new Date(value))
  .optional()

export const createLinkSchema = z
  .object({
    url: z.url({ protocol: /^https?$/ }).max(2048),
    expiresAt,
  })
  .strict()

export type CreateLinkInput = z.infer<typeof createLinkSchema>
