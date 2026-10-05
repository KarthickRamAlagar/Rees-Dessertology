import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShieldAlert } from "lucide-react";
import { selectUser } from "@/store/authSlice";
import { logoutUser } from "@/features/auth/authActions";

// Shown at /admin/** when someone is signed in but their Google email isn't
// in ADMIN_EMAILS. Hard-coded warm colours (not theme tokens) so it looks the
// same in light and dark mode.
export default function NotAuthorized() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "#fdfbf7" }}>
      <div className="w-full max-w-md rounded-3xl border p-7 sm:p-9 text-center shadow-[0_24px_60px_-24px_rgba(43,26,15,0.35)] bg-white" style={{ borderColor: "#e9d8ba", color: "#2b1a0f" }}>
        <div className="mx-auto mb-4 h-14 w-14 rounded-full flex items-center justify-center" style={{ background: "#fff3d6", color: "#a8761f" }}>
          <ShieldAlert size={28} />
        </div>
        <h1 className="text-xl font-bold mb-2">Not authorized</h1>
        <p className="text-sm mb-1" style={{ color: "#6b4226" }}>
          The admin dashboard is only for the shop owner's Google account.
        </p>
        {user?.email && (
          <p className="text-xs mb-6" style={{ color: "#8a7358" }}>
            You're signed in as <span className="font-medium">{user.email}</span>.
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="rounded-full px-5 py-2.5 text-sm font-medium text-white" style={{ background: "#c8912e" }}>
            Back to the store
          </Link>
          <button
            type="button"
            onClick={async () => {
              await logoutUser();
              navigate("/login?next=/admin");
            }}
            className="rounded-full px-5 py-2.5 text-sm font-medium border bg-white"
            style={{ borderColor: "#e0d2b6", color: "#402616" }}
          >
            Use a different account
          </button>
        </div>
      </div>
    </div>
  );
}
