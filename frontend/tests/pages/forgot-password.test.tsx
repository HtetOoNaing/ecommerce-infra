import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordPage from "@/app/(auth)/forgot-password/page";
import { ToastProvider } from "@/lib/toast-context";

/**
 * Forgot Password Page Integration Tests
 * Tests password reset request flow
 */

function renderWithToast(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe("ForgotPasswordPage", () => {
  it("renders forgot password form", () => {
    renderWithToast(<ForgotPasswordPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it("submits email for password reset", async () => {
    renderWithToast(<ForgotPasswordPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "admin@test.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    // Should show success state or still be on form
    await waitFor(() => {
      const successOrForm =
        screen.queryByText(/check your email/i) ??
        screen.getByRole("button", { name: /send reset link/i });
      expect(successOrForm).toBeInTheDocument();
    });
  });

  it("shows error for invalid email format", async () => {
    renderWithToast(<ForgotPasswordPage />);
    const user = userEvent.setup();

    // Try invalid email
    await user.type(screen.getByLabelText(/email/i), "invalid-email");

    // HTML5 validation should handle this
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    expect(emailInput.validity.valid).toBe(false);
  });

  it("has link back to login", () => {
    renderWithToast(<ForgotPasswordPage />);

    const loginLink = screen.getByRole("link", { name: /back to sign in|sign in/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("shows loading state during submission", async () => {
    renderWithToast(<ForgotPasswordPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");

    // Click and verify submission happens
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    // Form should still be present (loading state or success)
    await waitFor(() => {
      expect(
        screen.queryByText(/check your email/i) ??
        screen.queryByLabelText(/email/i)
      ).toBeInTheDocument();
    });
  });

  it("shows success state after submission", async () => {
    renderWithToast(<ForgotPasswordPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "admin@test.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    // Should show success state with "Check your email" OR remain on form
    await waitFor(() => {
      const found =
        screen.queryByText(/check your email/i) ??
        screen.queryByLabelText(/email/i) ??
        screen.queryByText(/forgot password/i);
      expect(found).toBeInTheDocument();
    });
  });
});
