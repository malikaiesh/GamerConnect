import { useQuery } from "@tanstack/react-query";
import { ReactNode, createContext, useContext } from "react";

const AuthContext = createContext<{
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  const value = { user, isLoading, isAuthenticated: !!user };
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}