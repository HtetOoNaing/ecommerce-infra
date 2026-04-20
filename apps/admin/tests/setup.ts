import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll, vi } from "vitest";
import { server } from "./mocks/server";

// Start MSW mock server
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  // Clear localStorage between tests
  if (typeof window !== "undefined") {
    localStorage.clear();
  }
});
afterAll(() => server.close());

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/dashboard",
  redirect: vi.fn(),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => {
    const React = require("react");
    return React.createElement("a", { href, ...props }, children);
  },
}));

// Mock recharts to avoid canvas issues in jsdom
vi.mock("recharts", () => {
  const React = require("react");
  const stub = ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "chart" }, children);
  return {
    ResponsiveContainer: stub,
    BarChart: stub,
    Bar: stub,
    PieChart: stub,
    Pie: stub,
    Cell: stub,
    XAxis: stub,
    YAxis: stub,
    CartesianGrid: stub,
    Tooltip: stub,
    Legend: stub,
  };
});
