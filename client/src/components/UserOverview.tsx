const UserOverview = () => {
  const users = [
    { name: "Ananya Sharma", role: "OPERATOR", email: "ananya.sharma@iocl.com" },
    { name: "Ravi Menon", role: "OPERATOR", email: "ravi.menon@iocl.com" },
    { name: "Priya Nair", role: "ADMIN", email: "priya.nair@iocl.com" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
      <h3 className="text-sm font-semibold text-brand-blue mb-4">User Overview</h3>
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.email} className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full border border-slate-200 text-brand-blue">
              {user.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOverview;
