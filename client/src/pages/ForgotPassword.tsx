import { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    console.log("Password reset requested for:", email);

    setTimeout(() => {
      setMessage("If this email exists, a reset link has been sent.");
      setLoading(false);
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-6 border rounded-md bg-white dark:bg-slate-900">
      <h2 className="text-xl font-semibold mb-2">Forgot Password</h2>
      <p className="text-sm text-slate-500 mb-4">
        Enter your email and we’ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@iocl.com"
          className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-orange text-white text-sm font-medium py-2 rounded-md"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {message && <p className="text-sm text-green-600">{message}</p>}
      </form>
    </div>
  );
};

export default ForgotPassword;
