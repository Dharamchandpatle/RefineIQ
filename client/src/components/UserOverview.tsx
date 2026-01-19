import { usersApi, type UserRecord } from "@/services/api";
import { useEffect, useMemo, useState } from "react";

const UserOverview = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await usersApi.getAll();
        setUsers(data || []);
      } catch (err) {
        setError("Unable to load user overview.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const displayUsers = useMemo(() => {
    return users.map((user) => ({
      key: user.id || user.email,
      name: user.full_name || user.email.split("@")[0],
      email: user.email,
      role: user.role || "OPERATOR",
    }));
  }, [users]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
      <h3 className="text-sm font-semibold text-brand-blue mb-4">User Overview</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {loading ? (
          <p className="text-xs text-slate-500">Loading users...</p>
        ) : error ? (
          <p className="text-xs text-brand-orange">{error}</p>
        ) : displayUsers.length === 0 ? (
          <p className="text-xs text-slate-500">No users found.</p>
        ) : (
          displayUsers.map((user) => (
            <div key={user.key} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full border border-slate-200 text-brand-blue">
                {user.role}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserOverview;
