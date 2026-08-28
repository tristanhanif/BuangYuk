/**
 * Payment Service
 *
 * Architecture:
 * Customer → Midtrans Sandbox → Success/Failure → BuangYuk Backend
 * Mock Fallback: Mock Payment → Simulated Success
 *
 * MVP: Midtrans Sandbox + Mock fallback
 * NOT production payment integration
 */

const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
const MIDTRANS_MERCHANT_ID = process.env.NEXT_PUBLIC_MIDTRANS_MERCHANT_ID || "";
const USE_MOCK = !MIDTRANS_CLIENT_KEY;

export interface PaymentParams {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  description: string;
}

export interface PaymentResult {
  success: boolean;
  orderId: string;
  transactionId?: string;
  paymentUrl?: string;
  mockMode?: boolean;
  message: string;
}

/**
 * Create a payment transaction
 * Falls back to mock if Midtrans is not configured
 */
export async function createPayment(params: PaymentParams): Promise<PaymentResult> {
  if (USE_MOCK) {
    return createMockPayment(params);
  }

  try {
    // In production, this calls your backend which creates a Midtrans Snap transaction
    const response = await fetch("/api/v1/webhooks/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: params.orderId,
        amount: params.amount,
        customerName: params.customerName,
        customerEmail: params.customerEmail,
        description: params.description,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        orderId: params.orderId,
        transactionId: data.transactionId,
        paymentUrl: data.paymentUrl,
        message: "Payment created successfully",
      };
    }

    return {
      success: false,
      orderId: params.orderId,
      message: data.error || "Payment failed",
    };
  } catch {
    // Fallback to mock on error
    console.warn("Midtrans failed, falling back to mock payment");
    return createMockPayment(params);
  }
}

/**
 * Mock payment for demo/prototype
 * Simulates instant success
 */
function createMockPayment(params: PaymentParams): PaymentResult {
  const mockTransactionId = `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  return {
    success: true,
    orderId: params.orderId,
    transactionId: mockTransactionId,
    mockMode: true,
    message: "Mock payment successful (sandbox mode)",
  };
}

/**
 * Verify payment status
 */
export async function verifyPayment(orderId: string): Promise<{ status: string; paid: boolean }> {
  if (USE_MOCK) {
    // Mock always returns paid
    return { status: "settlement", paid: true };
  }

  try {
    const response = await fetch(`/api/v1/webhooks/payment?orderId=${orderId}`);
    const data = await response.json();
    return {
      status: data.status || "pending",
      paid: data.status === "settlement" || data.status === "capture",
    };
  } catch {
    return { status: "error", paid: false };
  }
}

/**
 * Midtrans Snap integration for frontend
 * This is the standard Midtrans integration pattern
 */
export function loadMidtransSnap(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (USE_MOCK) {
      resolve();
      return;
    }

    const scriptId = "midtrans-snap";
    if (document.getElementById(scriptId)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", MIDTRANS_CLIENT_KEY);
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Midtrans Snap"));
    document.head.appendChild(script);
  });
}

/**
 * Open Midtrans Snap payment popup
 */
export async function openSnapPayment(
  snapToken: string,
  callbacks: {
    onSuccess?: (result: any) => void;
    onPending?: (result: any) => void;
    onError?: (error: any) => void;
    onClose?: () => void;
  }
): Promise<void> {
  if (USE_MOCK) {
    // Mock instant success
    setTimeout(() => {
      callbacks.onSuccess?.({
        transaction_id: `MOCK-${Date.now()}`,
        order_id: snapToken,
        status_code: "200",
        transaction_status: "settlement",
      });
    }, 1000);
    return;
  }

  try {
    await loadMidtransSnap();
    const snap = (window as any).snap;
    if (!snap) {
      callbacks.onError?.({ message: "Midtrans Snap not loaded" });
      return;
    }

    snap.pay(snapToken, {
      onSuccess: callbacks.onSuccess,
      onPending: callbacks.onPending,
      onError: callbacks.onError,
      onClose: callbacks.onClose,
    });
  } catch (error) {
    callbacks.onError?.(error);
  }
}
