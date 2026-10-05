import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import api from "@/services/api";
import { useIsAdmin } from "@/lib/isAdmin";
import chefLight from "@/assets/chef-light.png";
import chefDark from "@/assets/chef-dark.png";

const CONTACT_ITEMS = [
  { icon: Phone, value: "+91 98765 43210" },
  { icon: Mail, value: "hello@reesdessertology.com" },
  { icon: MapPin, value: "Guntur, Andhra Pradesh" },
];

export default function Contact() {
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Admins don't need the contact form — send them away if they land here.
  useEffect(() => {
    if (isAdmin) navigate("/", { replace: true });
  }, [isAdmin, navigate]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/api/contact", form);
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.error || "Couldn't send your message — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="rounded-2xl border border-caramel-400/20 bg-white/55 dark:bg-[#17110b]/65 shadow-sm overflow-hidden grid md:grid-cols-2 mb-9">
      <div className="min-h-[280px] md:min-h-[340px] flex items-center justify-center p-7 md:p-10 bg-caramel-400/5 dark:bg-black/10">
    <img
      src={chefLight}
      alt="Rees Dessertology Chef"
      className="w-60 h-60 md:w-72 md:h-72 object-contain dark:hidden"
    />

    <img
      src={chefDark}
      alt="Rees Dessertology Chef"
      className="hidden w-60 h-60 md:w-72 md:h-72 object-contain dark:block"
    />
  </div>

        <div className="p-7 md:p-10 flex items-center">
          {sent ? (
            <div className="w-full flex flex-col items-center justify-center text-center py-12">
              <span className="h-14 w-14 rounded-full bg-sage-500/15 flex items-center justify-center mb-3">
                <Send size={22} className="text-sage-500" />
              </span>
              <p className="text-cocoa-800 font-display text-xl font-semibold mb-1">Message sent!</p>
              <p className="text-sm text-cocoa-500">We'll get back to you shortly.</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="w-full space-y-3.5"
            >
              {error && <p className="text-sm text-berry-500">{error}</p>}
              <input
                required
                placeholder="Name"
                value={form.name}
                onChange={handleChange("name")}
                className="w-full h-11 border border-cocoa-500/25 rounded-xl px-4 text-sm bg-white/45 dark:bg-white/5 text-cocoa-800 placeholder:text-cocoa-400 outline-none focus:border-caramel-500 transition-colors"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange("email")}
                className="w-full h-11 border border-cocoa-500/25 rounded-xl px-4 text-sm bg-white/45 dark:bg-white/5 text-cocoa-800 placeholder:text-cocoa-400 outline-none focus:border-caramel-500 transition-colors"
              />
              <textarea
                required
                placeholder="Message"
                rows={4}
                value={form.message}
                onChange={handleChange("message")}
                className="w-full border border-cocoa-500/25 rounded-xl px-4 py-3 text-sm bg-white/45 dark:bg-white/5 text-cocoa-800 placeholder:text-cocoa-400 outline-none focus:border-caramel-500 transition-colors resize-none"
              />
              <button type="submit" disabled={submitting} className="btn-primary w-full h-11 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                <Send size={15} /> {submitting ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_auto] gap-6 md:gap-10 items-center px-2 md:px-5">
        <div>
          <h1 className="font-display text-4xl md:text-[3rem] font-bold text-cocoa-800 leading-none mb-2">
            Get in Touch
          </h1>
          <p className="font-script text-2xl text-caramel-600 dark:text-caramel-300">
            Have a question? We're here to help.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {CONTACT_ITEMS.map(({ icon: Icon, value }) => (
            <div key={value} className="flex items-center gap-3 text-sm text-cocoa-700">
              <span className="h-8 w-8 rounded-full bg-caramel-400/10 flex items-center justify-center text-caramel-600 dark:text-caramel-300 shrink-0">
                <Icon size={15} />
              </span>
              {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
