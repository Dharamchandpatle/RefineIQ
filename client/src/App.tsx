import AppShell from "@/components/layout/AppShell";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthContext, useAuthState } from "@/hooks/useAuth";
import AdminDashboard from "@/pages/AdminDashboard";
import Home from "@/pages/Home";
import HomePage from "@/pages/HomePage";
import Login from "@/pages/Login";
import OperatorDashboard from "@/pages/OperatorDashboard";
import Profile from "@/pages/Profile";
import Register from "@/pages/Register";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

const queryClient = new QueryClient();

const ProtectedRoute = ({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "ADMIN" | "OPERATOR";
}) => {
  // Auth checks temporarily disabled
  // const { isAuthenticated, isLoading, user } = useAuth();
  // if (isLoading) return null;
  // if (!isAuthenticated) return <Navigate to="/login" replace />;
  // if (role && user?.role !== role) {
  //   return <Navigate to="/dashboard" replace />;
  // }
  return <>{children}</>;
};

const RoleRedirect = () => {
  // Auth checks temporarily disabled
  // const { user, isAuthenticated, isLoading } = useAuth();
  // if (isLoading) return null;
  // if (!isAuthenticated) return <Navigate to="/login" replace />;
  // return <Navigate to={user?.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/operator"} replace />;
  return <Navigate to="/dashboard/operator" replace />;
};

const AppRoutes = () => {
  const authState = useAuthState();

  return (
    <AuthContext.Provider value={authState}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="/home-old" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<RoleRedirect />} />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/operator"
            element={
              <ProtectedRoute role="OPERATOR">
                <OperatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </AuthContext.Provider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
