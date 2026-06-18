import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Checkout from "./Checkout";
import { vi } from "vitest";

const mockUseCart = vi.fn();
const mockUseAuth = vi.fn();

vi.mock("../hooks/useCart", () => ({
  useCart: () => mockUseCart()
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => mockUseAuth()
}));

describe("Checkout page", () => {
  beforeEach(() => {
    mockUseCart.mockReturnValue({
      cart: [],
      cartTotal: 0,
      clearCart: vi.fn(),
      addToCart: vi.fn(),
      removeFromCart: vi.fn()
    });
    mockUseAuth.mockReturnValue({
      customer: null,
      addBooking: vi.fn(),
      createPaymentOrder: vi.fn(),
      verifyPayment: vi.fn()
    });
  });

  it("lets guests submit a callback request without login", () => {
    render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    );

    expect(screen.getByText("Please login before booking a service.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit Booking Request" })).toBeEnabled();
  });

  it("shows validation error when logged-in customer submits incomplete checkout", async () => {
    const user = userEvent.setup();

    mockUseCart.mockReturnValue({
      cart: [{ id: 1, name: "Patient Care", price: 1500, quantity: 1 }],
      cartTotal: 1500,
      clearCart: vi.fn(),
      addToCart: vi.fn(),
      removeFromCart: vi.fn()
    });
    mockUseAuth.mockReturnValue({
      customer: { name: "Asha", phone: "9876543210", email: "asha@sathi.com" },
      addBooking: vi.fn(),
      createPaymentOrder: vi.fn(),
      verifyPayment: vi.fn()
    });

    render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Place Order" }));

    expect(screen.getByText("Please complete cart and fill all required details.")).toBeInTheDocument();
  });

  it("blocks checkout when more than one service is present", async () => {
    const user = userEvent.setup();

    mockUseCart.mockReturnValue({
      cart: [
        { id: 1, name: "Patient Care", price: 1500, quantity: 1 },
        { id: 2, name: "Elderly Care", price: 2000, quantity: 1 }
      ],
      cartTotal: 3500,
      clearCart: vi.fn(),
      addToCart: vi.fn(),
      removeFromCart: vi.fn()
    });
    mockUseAuth.mockReturnValue({
      customer: { name: "Asha", phone: "9876543210", email: "asha@sathi.com" },
      addBooking: vi.fn(),
      createPaymentOrder: vi.fn(),
      verifyPayment: vi.fn()
    });

    render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    );

    const fields = {
      patientName: "Patient Name",
      patientPhone: "Patient Phone",
      patientAge: "Patient Age",
      patientAddress: "Patient Address",
      city: "City",
      state: "State",
      pincode: "Pincode"
    };

    for (const [value, label] of Object.entries(fields)) {
      await user.type(screen.getByLabelText(label), value);
    }
    await user.type(screen.getByLabelText("Patient Issues"), "Post surgery support");
    await user.click(screen.getByRole("button", { name: "Place Order" }));

    expect(screen.getByText("Backend currently supports one service per booking. Please keep only one service in the cart for checkout.")).toBeInTheDocument();
  });
});
