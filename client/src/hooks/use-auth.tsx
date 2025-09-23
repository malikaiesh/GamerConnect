import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReactNode, createContext, useContext } from "react";
import { useLocation } from "wouter";

const AuthContext = createContext<{
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  logoutMutation: any;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to logout");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation("/");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      setLocation("/");
    }
  });

  const value = { user, isLoading, isAuthenticated: !!user, logoutMutation };
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