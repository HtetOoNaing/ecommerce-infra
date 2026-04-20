import { z } from "zod";

export const shippingAddressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
});

export const createCheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive("Product ID must be a positive integer"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one item is required"),
  shippingAddress: shippingAddressSchema,
});
