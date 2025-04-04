"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const pathname = usePathname();
  const { isAuthenticated, customerId, logout } = useAuth();

  // Skip rendering navigation on auth pages
  if (pathname.startsWith("/auth/")) {
    return null;
  }

  const navItems = [
    { name: "Dashboard", path: "/", requireAuth: true },
    { name: "Vehicles", path: "/vehicles", requireAuth: true },
    { name: "Drivers", path: "/drivers", requireAuth: true },
    { name: "Trips", path: "/trips", requireAuth: true },
  ];

  // Filter nav items based on authentication status
  const filteredNavItems = navItems.filter(
    (item) => !item.requireAuth || isAuthenticated
  );

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold">VTS</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === item.path
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isAuthenticated ? (
                <div className="flex items-center">
                  <span className="text-gray-300 mr-4">
                    Customer ID: {customerId}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
