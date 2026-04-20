export interface CustomerEntity {
  id: number;
  email: string;
  password: string;
  name?: string;
  phone?: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerResponseDto {
  id: number;
  email: string;
  name?: string;
  phone?: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDto {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  emailVerified?: boolean;
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
  customer: CustomerResponseDto;
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
