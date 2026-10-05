import crypto from "node:crypto";

export function requireRazorpayConfig() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw Object.assign(
      new Error("Razorpay test credentials are not configured."),
      { statusCode: 500 }
    );
  }
}

export function razorpayAuthHeader() {
  requireRazorpayConfig();
  return "Basic " + Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString("base64");
}

export async function createRazorpayOrder({ amount, receipt, notes = {} }) {
  requireRazorpayConfig();
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: razorpayAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt,
      notes,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw Object.assign(
      new Error(data?.error?.description || "Unable to create Razorpay order."),
      { statusCode: response.status }
    );
  }
  return data;
}

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}) {
  requireRazorpayConfig();
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(String(signature || ""))
  );
}
