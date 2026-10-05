import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import AddressForm from "@/components/checkout/AddressForm";
import DeliveryOptions from "@/components/checkout/DeliveryOptions";
import PaymentMethod from "@/components/checkout/PaymentMethod";
import OrderSummary from "@/components/checkout/OrderSummary";
import { useCartStore } from "@/features/cart/cartStore";
import { createOrder } from "@/services/orders";
import { fetchBlockingFeedbackOrder } from "@/services/feedback";
import FeedbackForm from "@/components/feedback/FeedbackForm";

const DELIVERY_PRICES = { standard: 0, express: 79 };

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart, subtotal } = useCartStore();
  const placedRef = useRef(false);
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState(null);
  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("upi");
  const [isPlacing, setIsPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  // Part 5.4 — blocks a new order if a PAST order is still "awaiting
  // feedback" and its 2-day deadline has already passed with nothing
  // submitted. The check is made server-side for the signed-in uid (see
  // services/feedback.js), not from anything stored in this browser.
  const [blockingOrder, setBlockingOrder] = useState(null);

  // Redirecting must happen in an effect, not during render — calling navigate()
  // directly in the render body triggers React's "Cannot update a component while
  // rendering a different component" warning.
  useEffect(() => {
    if (items.length === 0 && !placedRef.current) {
      navigate("/cart");
    }
  }, [items.length, navigate]);

  if (items.length === 0 && !placedRef.current) {
    return null;
  }

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    setPlaceError("");
    try {
      const blocking = await fetchBlockingFeedbackOrder();
      if (blocking) {
        setBlockingOrder(blocking);
        setIsPlacing(false);
        return;
      }
      const order = await createOrder({ address, delivery, payment, items });
      // Mark placed BEFORE clearing the cart so the "empty cart -> /cart"
      // redirect above doesn't fire and drag the customer back to the cart.
      placedRef.current = true;
      clearCart();
      // QR/UPI is the only method: go straight to the dedicated payment chat
      // (pay, tap "I've paid", wait for the admin to confirm).
      navigate(`/order/${order.id}/chat`);
    } catch (err) {
      // Most commonly a 409 from the server when someone else just bought
      // the last of an item while this person was checking out.
      setPlaceError(err?.response?.data?.error || "Couldn't place the order — please try again.");
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-cocoa-800 mb-6 text-center">Checkout</h1>
      <CheckoutStepper step={step} />

      <div className="grid md:grid-cols-[1fr_320px] gap-8">
        <div>
          {step === 0 && (
            <AddressForm
              defaultValues={address}
              onNext={(data) => {
                setAddress(data);
                setStep(1);
              }}
            />
          )}
          {step === 1 && (
            <DeliveryOptions
              selected={delivery}
              onSelect={setDelivery}
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && placeError && (
            <p className="text-danger-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              {placeError}
            </p>
          )}
          {step === 2 && (
            <PaymentMethod
              selected={payment}
              onSelect={setPayment}
              onBack={() => setStep(1)}
              onPay={handlePlaceOrder}
              isPlacing={isPlacing}
              amount={subtotal() + DELIVERY_PRICES[delivery]}
            />
          )}
        </div>

        <OrderSummary deliveryPrice={DELIVERY_PRICES[delivery]} />
      </div>

      {blockingOrder && (
        <FeedbackForm
          order={{
            id: blockingOrder.orderNumber,
            items: (blockingOrder.items || []).map((i) => ({ name: i.productName })),
            total: blockingOrder.total,
          }}
          onClose={() => setBlockingOrder(null)}
          onSubmitted={() => setBlockingOrder(null)}
        />
      )}
    </div>
  );
}
