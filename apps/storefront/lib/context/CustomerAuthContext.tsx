"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { Customer } from "@infrapro/shared-types";
import {
  loginCustomer,
  registerCustomer,
  logoutCustomer,
  getStoredCustomer,
  setStoredCustomer,
  clearCustomerAuth,
} from "@/lib/api/customer-auth";

interface CustomerAuthContextType {
  customer: Customer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(
  undefined
);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for stored customer on mount
  useEffect(() => {
    const stored = getStoredCustomer();
    if (stored) {
      setCustomer(stored);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { customer: customerData } = await loginCustomer(email, password);
    setCustomer(customerData);
    setStoredCustomer(customerData);
  };

  const register = async (data: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
  }) => {
    const { customer: customerData } = await registerCustomer(data);
    setCustomer(customerData);
    setStoredCustomer(customerData);
  };

  const logout = async () => {
    try {
      await logoutCustomer();
    } finally {
      setCustomer(null);
      clearCustomerAuth();
      router.push("/");
    }
  };

  return (
    <CustomerAuthContext
      value={{
        customer,
        isLoading,
        isAuthenticated: !!customer,
        login,
        register,
        logout,
      }}
    >
      {children}
    </CustomerAuthContext>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error(
      "useCustomerAuth must be used within a CustomerAuthProvider"
    );
  }
  return context;
}
