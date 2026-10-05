import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema } from "./addressSchema";

const FIELD_CLASS =
  "w-full border border-cream-300 rounded-lg px-3 py-2 text-sm text-cocoa-700 bg-white/70 focus:outline-none focus:ring-2 focus:ring-caramel-400";

export default function AddressForm({ onNext, defaultValues }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: defaultValues || {},
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="glass-panel rounded-glass p-6 space-y-4">
      <h2 className="font-semibold text-cocoa-800 text-lg mb-2">Delivery Address</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-cocoa-600 mb-1 block">Full Name</label>
          <input {...register("fullName")} className={FIELD_CLASS} placeholder="Karthi" />
          {errors.fullName && <p className="text-berry-500 text-xs mt-1">{errors.fullName.message}</p>}
        </div>
        <div>
          <label className="text-sm text-cocoa-600 mb-1 block">Phone Number</label>
          <input {...register("phone")} className={FIELD_CLASS} placeholder="9876543210" />
          {errors.phone && <p className="text-berry-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label className="text-sm text-cocoa-600 mb-1 block">Address Line 1</label>
        <input {...register("addressLine1")} className={FIELD_CLASS} placeholder="House no, Street" />
        {errors.addressLine1 && <p className="text-berry-500 text-xs mt-1">{errors.addressLine1.message}</p>}
      </div>

      <div>
        <label className="text-sm text-cocoa-600 mb-1 block">Address Line 2 (optional)</label>
        <input {...register("addressLine2")} className={FIELD_CLASS} placeholder="Landmark, area" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm text-cocoa-600 mb-1 block">City</label>
          <input {...register("city")} className={FIELD_CLASS} placeholder="Guntur" />
          {errors.city && <p className="text-berry-500 text-xs mt-1">{errors.city.message}</p>}
        </div>
        <div>
          <label className="text-sm text-cocoa-600 mb-1 block">State</label>
          <input {...register("state")} className={FIELD_CLASS} placeholder="Andhra Pradesh" />
          {errors.state && <p className="text-berry-500 text-xs mt-1">{errors.state.message}</p>}
        </div>
        <div>
          <label className="text-sm text-cocoa-600 mb-1 block">Pincode</label>
          <input {...register("pincode")} className={FIELD_CLASS} placeholder="522xxx" />
          {errors.pincode && <p className="text-berry-500 text-xs mt-1">{errors.pincode.message}</p>}
        </div>
      </div>

      <button type="submit" className="btn-primary w-full mt-2">Continue to Delivery</button>
    </form>
  );
}
