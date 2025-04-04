"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

// Define the auth state interface
interface AuthState {
  isAuthenticated: boolean;
  customerId: number | null;
  loading: boolean;
}

// Define the auth context interface
interface AuthContextProps extends AuthState {
  login: (customerId: number) => void;
  logout: () => void;
}

// Create the auth context with a default value
const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  customerId: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    customerId: null,
    loading: true,
  });
  const router = useRouter();

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    // Only access localStorage in the browser environment
    if (typeof window !== "undefined") {
      console.log("AuthContext: Initializing from localStorage");
      const storedCustomerId = localStorage.getItem("customerId");
      console.log(
        "AuthContext: Retrieved customerId from localStorage:",
        storedCustomerId
      );

      if (storedCustomerId) {
        console.log(
          "AuthContext: Setting authenticated state with customerId:",
          storedCustomerId
        );
        setAuthState({
          isAuthenticated: true,
          customerId: Number(storedCustomerId),
          loading: false,
        });
      } else {
        console.log(
          "AuthContext: No customerId found, setting unauthenticated state"
        );
        setAuthState({
          isAuthenticated: false,
          customerId: null,
          loading: false,
        });
      }
    }
  }, []);

  // Login function
  const login = (customerId: number) => {
    console.log("AuthContext: Login called with customerId:", customerId);

    if (typeof window !== "undefined") {
      console.log(
        "AuthContext: Storing customerId in localStorage:",
        customerId
      );
      localStorage.setItem("customerId", customerId.toString());
    }

    console.log("AuthContext: Setting authenticated state");
    setAuthState({
      isAuthenticated: true,
      customerId,
      loading: false,
    });

    console.log("AuthContext: Redirecting to dashboard");
    router.push("/");
  };

  // Logout function
  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("customerId");
    }

    setAuthState({
      isAuthenticated: false,
      customerId: null,
      loading: false,
    });

    router.push("/auth/login");
  };

  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Auth route protection HOC
export function withAuth(Component: React.ComponentType) {
  return function AuthenticatedComponent(props: any) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push("/auth/login");
      }
    }, [loading, isAuthenticated, router]);

    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}
