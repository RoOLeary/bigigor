import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the structure of an authorized user
export interface AuthorizedUser {
  email: string;
  role: 'PARTY_MEMBER' | 'INNER_CIRCLE' | 'OBSERVER';
}

// List of authorized users with their roles
// In a production environment, this would be handled by a backend authentication service
export const AUTHORIZED_USERS: AuthorizedUser[] = [
  { email: "guillaiume@ministry.gov", role: "PARTY_MEMBER" },
  { email: "cyril@ministry.gov", role: "PARTY_MEMBER" },
  { email: "sarantos@ministry.gov", role: "PARTY_MEMBER" },
  { email: "aytac@ministry.gov", role: "PARTY_MEMBER" },
  { email: "ronan@ministry.gov", role: "INNER_CIRCLE" },
  { email: "proletariat@ministry.gov", role: "OBSERVER" }
];

// Interface defining the shape of our auth state and actions
interface AuthState {
  // Authentication state
  isAuthenticated: boolean;      // Current authentication status
  user: AuthorizedUser | null;   // Currently authenticated user
  error: string | null;          // Authentication error message
  fadeOut: boolean;              // UI transition state for authentication

  // Authentication actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  setFadeOut: (fade: boolean) => void;
}

/**
 * Validates user credentials against security requirements
 * @param email - User's email address (must be @ministry.gov domain)
 * @param password - User's password (must meet security requirements)
 * @returns Object containing validation result and optional error message
 */
const validateCredentials = (email: string, password: string): { valid: boolean; error?: string } => {
  // Validate email format (@ministry.gov domain)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@ministry\.gov$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "INVALID EMAIL FORMAT - MINISTRY EMAILS ONLY" };
  }

  // Validate password requirements:
  // - At least 8 characters
  // - Contains uppercase letter
  // - Contains number
  // - Contains special character
  const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
  if (!passwordRegex.test(password)) {
    return { valid: false, error: "PASSWORD DOES NOT MEET SECURITY REQUIREMENTS" };
  }

  // Check if user is in the authorized users list
  const authorizedUser = AUTHORIZED_USERS.find(user => user.email === email);
  if (!authorizedUser) {
    return { valid: false, error: "ACCESS DENIED - UNAUTHORIZED USER" };
  }

  return { valid: true };
};

// Create the auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      error: null,
      fadeOut: false,

      // Login action - validates credentials and updates authentication state
      login: async (email: string, password: string) => {
        // Clear any existing errors before attempting login
        set({ error: null });

        // Validate user credentials
        const validation = validateCredentials(email, password);
        
        if (!validation.valid) {
          set({ error: validation.error });
          return false;
        }

        // Find the authorized user
        const user = AUTHORIZED_USERS.find(u => u.email === email);
        
        if (!user) {
          set({ error: "AUTHENTICATION FAILED" });
          return false;
        }

        // Trigger fade out animation
        set({ fadeOut: true });

        // Add dramatic pause for effect
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update authentication state
        set({
          isAuthenticated: true,
          user,
          error: null,
          fadeOut: false
        });

        return true;
      },

      // Logout action - resets authentication state
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          error: null,
          fadeOut: false
        });
      },

      // Clear error message
      clearError: () => {
        set({ error: null });
      },

      // Set fade out animation state
      setFadeOut: (fade: boolean) => {
        set({ fadeOut: fade });
      }
    }),
    {
      // Persistence configuration using localStorage
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist authentication state and user info
        isAuthenticated: state.isAuthenticated,
        user: state.user
      })
    }
  )
);