import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "@/lib/toast-context";

/**
 * Toast Context Tests - Basic Functionality
 */

function ToastConsumer() {
  const { success, error, info } = useToast();

  return (
    <div>
      <button onClick={() => success("Success message")}>Show Success</button>
      <button onClick={() => error("Error message")}>Show Error</button>
      <button onClick={() => info("Info message")}>Show Info</button>
    </div>
  );
}

function renderWithToast(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe("ToastContext", () => {
  it("provides toast functions", () => {
    renderWithToast(<ToastConsumer />);

    expect(screen.getByText("Show Success")).toBeInTheDocument();
    expect(screen.getByText("Show Error")).toBeInTheDocument();
    expect(screen.getByText("Show Info")).toBeInTheDocument();
  });

  it("shows success toast", async () => {
    renderWithToast(<ToastConsumer />);
    const user = userEvent.setup();

    await user.click(screen.getByText("Show Success"));

    expect(screen.getByText("Success message")).toBeInTheDocument();
  });

  it("shows error toast", async () => {
    renderWithToast(<ToastConsumer />);
    const user = userEvent.setup();

    await user.click(screen.getByText("Show Error"));

    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it("shows info toast", async () => {
    renderWithToast(<ToastConsumer />);
    const user = userEvent.setup();

    await user.click(screen.getByText("Show Info"));

    expect(screen.getByText("Info message")).toBeInTheDocument();
  });

  it("shows multiple toasts", async () => {
    renderWithToast(<ToastConsumer />);
    const user = userEvent.setup();

    await user.click(screen.getByText("Show Success"));
    await user.click(screen.getByText("Show Error"));
    await user.click(screen.getByText("Show Info"));

    expect(screen.getByText("Success message")).toBeInTheDocument();
    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.getByText("Info message")).toBeInTheDocument();
  });
});
