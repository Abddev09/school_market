/**
 * Cache utility for storing sensitive data (token, role, id) using cookies.
 * Note: HttpOnly cookies cannot be set from client JS. These are client-side cookies.
 */

const COOKIE_PREFIX = "app_";

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\/+^])/g, "\\$1") + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : null;
};

const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60; // seconds
  const secure = location && location.protocol === "https:" ? "; Secure" : "";
  const sameSite = "; SameSite=Lax";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}${sameSite}${secure}`;
};

const removeCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
};

export const cache = {
  // Token management
  setToken: (token: string) => {
    setCookie(`${COOKIE_PREFIX}token`, token, 7);
  },
  getToken: (): string | null => {
    return getCookie(`${COOKIE_PREFIX}token`);
  },
  removeToken: () => {
    removeCookie(`${COOKIE_PREFIX}token`);
  },

  // Role management (base64 encoded)
  setRole: (role: string | number) => {
    const hashedRole = btoa(String(role));
    setCookie(`${COOKIE_PREFIX}role`, hashedRole, 7);
  },
  getRole: (): string | null => {
    return getCookie(`${COOKIE_PREFIX}role`);
  },
  getDecodedRole: (): number | null => {
    const role = getCookie(`${COOKIE_PREFIX}role`);
    if (!role) return null;
    try {
      return Number(atob(role));
    } catch (err) {
      console.error("Role decode xatolik:", err);
      return null;
    }
  },
  removeRole: () => {
    removeCookie(`${COOKIE_PREFIX}role`);
  },

  // ID management
  setId: (id: string | number) => {
    setCookie(`${COOKIE_PREFIX}id`, String(id), 7);
  },
  getId: (): string | null => {
    return getCookie(`${COOKIE_PREFIX}id`);
  },
  getIdAsNumber: (): number | null => {
    const id = getCookie(`${COOKIE_PREFIX}id`);
    return id ? Number(id) : null;
  },
  removeId: () => {
    removeCookie(`${COOKIE_PREFIX}id`);
  },

  // Logout - clear all
  clearAll: () => {
    removeCookie(`${COOKIE_PREFIX}token`);
    removeCookie(`${COOKIE_PREFIX}role`);
    removeCookie(`${COOKIE_PREFIX}id`);
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!(getCookie(`${COOKIE_PREFIX}token`) && getCookie(`${COOKIE_PREFIX}role`));
  },
};
