export interface CheckoutItemDto {
  productId: number;
  quantity: number;
}

export interface ShippingAddressDto {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CreateCheckoutDto {
  items: CheckoutItemDto[];
  shippingAddress: ShippingAddressDto;
}

export interface CheckoutSessionResponse {
  clientSecret: string;
}

export interface WebhookItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  name: string;
}
