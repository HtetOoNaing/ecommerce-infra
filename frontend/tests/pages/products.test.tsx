import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductsPage from "@/app/dashboard/products/page";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import { setAccessToken } from "@/lib/api";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";

const API = "https://api.infra-pro.com/api/v1";

function renderProducts() {
  return render(
    <AuthProvider>
      <ToastProvider>
        <ProductsPage />
      </ToastProvider>
    </AuthProvider>
  );
}

beforeEach(() => {
  // Simulate logged-in admin
  setAccessToken("mock-access-token");
  localStorage.setItem(
    "user",
    JSON.stringify({ id: 1, email: "admin@test.com", name: "Admin", role: "admin", isVerified: true })
  );
});

describe("ProductsPage", () => {
  it("shows loading skeleton initially", () => {
    renderProducts();
    expect(screen.getByText("Products")).toBeInTheDocument();
  });

  it("renders product table after loading", async () => {
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
    });

    expect(screen.getByText("Magic Keyboard")).toBeInTheDocument();
    expect(screen.getByText("MBP-16-2026")).toBeInTheDocument();
    expect(screen.getByText("MK-2026")).toBeInTheDocument();
  });

  it("shows Active/Inactive badges", async () => {
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
    });

    const badges = screen.getAllByText(/Active|Inactive/);
    expect(badges.length).toBeGreaterThanOrEqual(2);
  });

  it("filters products by search", async () => {
    const user = userEvent.setup();
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText("Search by name or SKU..."), "Magic");

    expect(screen.getByText("Magic Keyboard")).toBeInTheDocument();
    expect(screen.queryByText("MacBook Pro")).not.toBeInTheDocument();
  });

  it("shows empty state when search has no results", async () => {
    const user = userEvent.setup();
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText("Search by name or SKU..."), "nonexistent");

    expect(screen.getByText("No products found")).toBeInTheDocument();
    expect(screen.getByText("Try a different search term")).toBeInTheDocument();
  });

  it("opens create modal on Add Product click", async () => {
    const user = userEvent.setup();
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Add Product"));

    await waitFor(() => {
      expect(screen.getByText("New Product")).toBeInTheDocument();
    });
  });

  it("opens edit modal on edit button click", async () => {
    const user = userEvent.setup();
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Edit MacBook Pro"));

    await waitFor(() => {
      expect(screen.getByText("Edit Product")).toBeInTheDocument();
    });
  });

  it("opens delete confirm on delete button click", async () => {
    const user = userEvent.setup();
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Delete MacBook Pro"));

    await waitFor(() => {
      expect(screen.getByText("Delete Product")).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete "MacBook Pro"/)).toBeInTheDocument();
    });
  });

  it("deletes product and shows toast", async () => {
    const user = userEvent.setup();
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Delete MacBook Pro"));
    await waitFor(() => {
      expect(screen.getByText("Delete Product")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(screen.getByText(/"MacBook Pro" deleted/)).toBeInTheDocument();
    });
  });

  it("shows empty state when API returns no products", async () => {
    server.use(
      http.get(`${API}/products`, () => {
        return HttpResponse.json([]);
      })
    );

    renderProducts();

    await waitFor(() => {
      expect(screen.getByText("No products found")).toBeInTheDocument();
      expect(screen.getByText("Create your first product to get started")).toBeInTheDocument();
    });
  });
});
