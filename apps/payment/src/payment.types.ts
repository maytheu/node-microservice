import { z } from 'zod';

const SummaryDTO = z.object({ cart: z.string() }).strict();

export { SummaryDTO };
