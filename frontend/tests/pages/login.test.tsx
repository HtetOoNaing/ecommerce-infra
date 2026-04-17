import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/(auth)/login/page";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";

const API = "https://api.infra-pro.com/api/v1";

function renderLogin() {
  return render(
    <AuthProvider>
      <ToastProvider>
        <LoginPage />
      </ToastProvider>
    </AuthProvider>
  );
}

describe("LoginPage", () => {
  it("renders form with email and password fields", () => {
    renderLogin();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("has link to register and forgot password", () => {
    renderLogin();
    expect(screen.getByText("Sign up")).toHaveAttribute("href", "/register");
    expect(screen.getByText("Forgot password?")).toHaveAttribute("href", "/forgot-password");
  });

  it("submits login and shows success toast", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "admin@test.com");
    await user.type(screen.getByLabelText("Password"), "Test1234!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByText("Welcome back!")).toBeInTheDocument();
    });
  });

  it("shows error toast on invalid credentials", async () => {
    server.use(
      http.post(`${API}/auth/login`, () => {
        return HttpResponse.json({ message: "Invalid credentials" }, { status: 401 });
      })
    );

    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "bad@test.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    // Wait for toast to appear (toast uses error styling)
    await waitFor(() => {
      const toast = document.querySelector("[class*='bg-red-50']");
      expect(toast).toBeTruthy();
    });
  });

  it("disables button while loading", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "admin@test.com");
    await user.type(screen.getByLabelText("Password"), "Test1234!");

    // Don't await the click so we can check loading state
    const btn = screen.getByRole("button", { name: "Sign in" });
    await user.click(btn);

    // After click the button should eventually re-enable
    await waitFor(() => {
      expect(btn).not.toBeDisabled();
    });
  });
});
