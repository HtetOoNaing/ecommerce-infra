import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { setAccessToken } from "@/lib/api";

function AuthConsumer() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  return (
    <div>
      <p data-testid="loading">{String(isLoading)}</p>
      <p data-testid="authenticated">{String(isAuthenticated)}</p>
      <p data-testid="user">{user ? user.email : "none"}</p>
      <button onClick={() => login("admin@test.com", "Test1234!")}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );
}

describe("AuthProvider", () => {
  it("starts unauthenticated", async () => {
    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user")).toHaveTextContent("none");
  });

  it("logs in and sets user", async () => {
    const user = userEvent.setup();
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await user.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
      expect(screen.getByTestId("user")).toHaveTextContent("admin@test.com");
    });
  });

  it("logs out and clears user", async () => {
    const user = userEvent.setup();
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await user.click(screen.getByText("Login"));
    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    await user.click(screen.getByText("Logout"));
    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
      expect(screen.getByTestId("user")).toHaveTextContent("none");
    });
  });

  it("restores session from localStorage", async () => {
    // Pre-populate localStorage
    setAccessToken("existing-token");
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1, email: "admin@test.com", name: "Admin", role: "admin", isVerified: true })
    );

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("user")).toHaveTextContent("admin@test.com");
  });
});

describe("useAuth outside provider", () => {
  it("throws error", () => {
    expect(() => {
      function Bad() {
        useAuth();
        return null;
      }
      render(<Bad />);
    }).toThrow("useAuth must be used within AuthProvider");
  });
});
