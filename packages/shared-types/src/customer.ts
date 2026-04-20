// ─── Customer ─────────────────────────────────────────

export interface Customer {
  id: number;
  email: string;
  name?: string | null;
  phone?: string | null;
  emailVerified: boolean;
  shippingAddresses: Array<{
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    isDefault: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  phone?: string;
}

export interface CustomerLoginDto {
  email: string;
  password: string;
}

export interface CustomerAuthResponse {
  customer: Customer;
  accessToken: string;
  refreshToken: string;
}

export interface AddAddressDto {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault?: boolean;
}
