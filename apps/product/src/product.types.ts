import { z } from 'zod';

const ProductDTO = z
  .object({
    name: z.string(),
    description: z.string(),
    price: z.number(),
    quantity: z.number(),
  })
  .strict();

const NewProductDTO = z
  .object({
    name: z.array(z.string({ required_error: 'name is required' })),
    description: z.array(
      z.string({ required_error: 'description is required' })
    ),
    price: z.array(z.string()),
    quantity: z.array(z.string()),
  })
  .strict();

const IProduct = ProductDTO.merge(z.object({ image: z.string() }));

type IProduct = z.infer<typeof IProduct>;
type IProductQuery = z.infer<typeof NewProductDTO>;

export { IProduct, IProductQuery, NewProductDTO };
