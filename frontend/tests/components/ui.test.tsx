import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Input from "@/components/ui/input";
import Pagination from "@/components/ui/pagination";
import Spinner from "@/components/ui/spinner";
import EmptyState from "@/components/ui/empty-state";
import Skeleton, { TableSkeleton } from "@/components/ui/skeleton";
import ConfirmModal from "@/components/ui/confirm-modal";

// ─── Button ─────────────────────────────────────────
describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("applies primary variant by default", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-indigo-600");
  });

  it("applies secondary variant", () => {
    render(<Button variant="secondary">Cancel</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-white");
  });

  it("applies danger variant", () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-red-600");
  });

  it("shows loading spinner and disables when isLoading", () => {
    render(<Button isLoading>Saving</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn.querySelector(".animate-spin")).toBeTruthy();
  });

  it("fires onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders icon", () => {
    render(<Button icon={<span data-testid="icon" />}>With Icon</Button>);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>No</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

// ─── Badge ──────────────────────────────────────────
describe("Badge", () => {
  it("renders text", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies success variant", () => {
    render(<Badge variant="success">OK</Badge>);
    expect(screen.getByText("OK")).toHaveClass("bg-emerald-100");
  });

  it("applies warning variant", () => {
    render(<Badge variant="warning">Pending</Badge>);
    expect(screen.getByText("Pending")).toHaveClass("bg-amber-100");
  });

  it("applies default variant when none specified", () => {
    render(<Badge>Normal</Badge>);
    expect(screen.getByText("Normal")).toHaveClass("bg-gray-100");
  });
});

// ─── Input ──────────────────────────────────────────
describe("Input", () => {
  it("renders label", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveClass("border-red-300");
  });

  it("passes value and onChange", () => {
    const onChange = vi.fn();
    render(<Input label="Name" value="test" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "new" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("generates id from label", () => {
    render(<Input label="First Name" />);
    expect(screen.getByLabelText("First Name")).toHaveAttribute("id", "first-name");
  });
});

// ─── Pagination ─────────────────────────────────────
describe("Pagination", () => {
  it("renders nothing when totalPages <= 1", () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders page buttons", () => {
    render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("highlights current page", () => {
    render(<Pagination page={2} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByText("2")).toHaveClass("bg-indigo-600");
  });

  it("disables prev on first page", () => {
    render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByLabelText("Previous page")).toBeDisabled();
  });

  it("disables next on last page", () => {
    render(<Pagination page={3} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });

  it("calls onPageChange when clicking page", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={3} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText("2"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});

// ─── Spinner ────────────────────────────────────────
describe("Spinner", () => {
  it("renders with spin animation", () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(<Spinner className="w-8 h-8" />);
    expect(container.firstChild).toHaveClass("w-8", "h-8");
  });
});

// ─── EmptyState ─────────────────────────────────────
describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="No items" description="Nothing here" />);
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders action", () => {
    render(<EmptyState title="Empty" action={<button>Add</button>} />);
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("renders without description", () => {
    render(<EmptyState title="Empty" />);
    expect(screen.getByText("Empty")).toBeInTheDocument();
  });
});

// ─── Skeleton ───────────────────────────────────────
describe("Skeleton", () => {
  it("renders with pulse animation", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass("animate-pulse");
  });
});

describe("TableSkeleton", () => {
  it("renders correct number of rows and cols", () => {
    const { container } = render(<TableSkeleton rows={3} cols={2} />);
    const rows = container.querySelectorAll(".flex.gap-4");
    expect(rows).toHaveLength(3);
    // Each row has 2 skeleton cells
    rows.forEach((row) => {
      expect(row.children).toHaveLength(2);
    });
  });
});

// ─── ConfirmModal ───────────────────────────────────
describe("ConfirmModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <ConfirmModal open={false} title="Delete" description="Sure?" onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders title and description when open", () => {
    render(
      <ConfirmModal open={true} title="Delete Item" description="Are you sure?" onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByText("Delete Item")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button clicked", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmModal open={true} title="Delete" description="Sure?" confirmLabel="Yes" onConfirm={onConfirm} onCancel={vi.fn()} />
    );
    fireEvent.click(screen.getByText("Yes"));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when cancel button clicked", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal open={true} title="Delete" description="Sure?" onConfirm={vi.fn()} onCancel={onCancel} />
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("calls onCancel on Escape key", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal open={true} title="Delete" description="Sure?" onConfirm={vi.fn()} onCancel={onCancel} />
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
