import { z } from 'zod';

const NewProductDTO = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  quantity: z.number(),
});

const IProduct = NewProductDTO.merge(z.object({ image: z.string() }));

type IProduct = z.infer<typeof IProduct>;
type IProductQuery = z.infer<typeof NewProductDTO>;

export { IProduct, IProductQuery, NewProductDTO };
