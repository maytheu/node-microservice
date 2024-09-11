import { z } from 'zod';

interface IPlaceOrder {
  productId: string;
  quantity: number;
  userId: string;
}

const OrderCartDTO = z
  .object({
    quantity: z.number(),
  })
  .strict();

const UpdateOrderDTO = z
  .object({
    name: z.string().optional(),
    quantity: z.number().optional(),
    paymentInitialized: z.boolean().optional(),
    isPaid: z.boolean().optional(),
  })
  .strict();

type IUpdateOrder = z.infer<typeof UpdateOrderDTO>;

export { IPlaceOrder, OrderCartDTO, IUpdateOrder, UpdateOrderDTO };
