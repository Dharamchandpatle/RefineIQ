import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";



const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);
      const role = response?.user?.role || "OPERATOR";
      navigate(role === "ADMIN" ? "/dashboard/admin" : "/dashboard/operator");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="w-full max-w-xl mx-auto mt-10 border border-slate-200 dark:border-slate-800 rounded-lg p-8 bg-white dark:bg-slate-900 shadow-sm">
      <h2 className="text-2xl font-semibold text-brand-blue mb-2">Sign in</h2>
      <p className="text-sm text-slate-500 mb-6">
        Access the AI-driven smart refinery dashboards.
      </p>
        
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm text-slate-600 dark:text-slate-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@iocl.com"
            className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm text-slate-600 dark:text-slate-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900"
            required
          />
        </div>
        <div className="text-right">
       <button
       type="button"
        onClick={() => navigate("/forgot-password")}
        className="text-sm text-brand-blue hover:underline"
       >
    Forgot Password?
  </button>
</div>

        

        {error ? <p className="text-sm text-brand-orange">{error}</p> : null}


        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-orange text-white text-sm font-medium py-2 rounded-md"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-500 text-center">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="text-brand-blue font-medium"
        >
          Register
        </button>
      </p>
    </div>
  );
};

export default Login;
