import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    role: "OPERATOR",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Please ensure both password fields are identical.",
      });
      return;
    }

    toast.success("Registration request submitted", {
      description: "Your account will be reviewed. Please sign in after approval.",
    });
    navigate("/login");
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 border border-slate-200 dark:border-slate-800 rounded-lg p-8 bg-white dark:bg-slate-900 shadow-sm">
      <h2 className="text-2xl font-semibold text-brand-blue mb-2">Create account</h2>
      <p className="text-sm text-slate-500 mb-6">
        Register for RefineryIQ access. Provide operational details for approval.
      </p>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="fullName" className="text-sm text-slate-600 dark:text-slate-300">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Your name"
            className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="text-sm text-slate-600 dark:text-slate-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@iocl.com"
            className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="text-sm text-slate-600 dark:text-slate-300">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900"
            required
          />
        </div>

        <div>
          <label htmlFor="department" className="text-sm text-slate-600 dark:text-slate-300">
            Department
          </label>
          <input
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="Operations"
            className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900"
            required
          />
        </div>

        <div>
          <label htmlFor="role" className="text-sm text-slate-600 dark:text-slate-300">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900"
          >
            <option value="OPERATOR">Operator</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div>
          <label htmlFor="password" className="text-sm text-slate-600 dark:text-slate-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="text-sm text-slate-600 dark:text-slate-300">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900"
            required
          />
        </div>

        <div className="md:col-span-2">
          <Button type="submit" className="w-full">
            Submit Registration
          </Button>
          <p className="mt-4 text-sm text-slate-500 text-center">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-brand-blue font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
