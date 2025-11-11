"use client";

import { useEffect, useContext, createContext } from "react";
import { hexToRgb, getPersonaPrimaryColor } from "@/lib/persona-utils";

export type Persona = "student" | "parent" | "tutor";

// Create context for persona
const PersonaContext = createContext<Persona>("student");

/**
 * Hook to get the current persona from context
 */
export function usePersona(): Persona {
  const context = useContext(PersonaContext);
  // Fallback to reading from DOM attribute if context not available
  if (!context) {
    if (typeof document !== "undefined") {
      const personaAttr = document.documentElement.getAttribute("data-persona");
      return (personaAttr as Persona) || "student";
    }
    return "student";
  }
  return context;
}

interface PersonaProviderProps {
  persona: Persona;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  children?: React.ReactNode;
}

/**
 * PersonaProvider sets the data-persona attribute on the document root
 * and optionally overrides theme colors with custom user colors.
 * 
 * Usage:
 * ```tsx
 * <PersonaProvider 
 *   persona={session.user.persona}
 *   primaryColor={user.primaryColor}
 *   secondaryColor={user.secondaryColor}
 * >
 *   {children}
 * </PersonaProvider>
 * ```
 */
export function PersonaProvider({ 
  persona, 
  primaryColor,
  secondaryColor,
  children 
}: PersonaProviderProps) {
  useEffect(() => {
    // Set data-persona attribute on document element
    document.documentElement.setAttribute("data-persona", persona);

    // Determine the primary color to use (user's custom color or persona default)
    const effectivePrimaryColor = primaryColor || getPersonaPrimaryColor(persona);

    // Set HTML element's color style to the primary color
    document.documentElement.style.color = effectivePrimaryColor;

    // Override with custom colors if set
    if (primaryColor) {
      const rgb = hexToRgb(primaryColor);
      if (rgb) {
        document.documentElement.style.setProperty("--persona-primary", rgb);
        document.documentElement.style.setProperty("--persona-gradient-from", rgb);
      }
    } else {
      // Remove custom override, let CSS default take over
      document.documentElement.style.removeProperty("--persona-primary");
      document.documentElement.style.removeProperty("--persona-gradient-from");
    }

    if (secondaryColor) {
      const rgb = hexToRgb(secondaryColor);
      if (rgb) {
        document.documentElement.style.setProperty("--persona-secondary", rgb);
        document.documentElement.style.setProperty("--persona-gradient-to", rgb);
      }
    } else {
      document.documentElement.style.removeProperty("--persona-secondary");
      document.documentElement.style.removeProperty("--persona-gradient-to");
    }

    // Cleanup on unmount or persona change
    return () => {
      document.documentElement.removeAttribute("data-persona");
      document.documentElement.style.removeProperty("color");
      document.documentElement.style.removeProperty("--persona-primary");
      document.documentElement.style.removeProperty("--persona-secondary");
      document.documentElement.style.removeProperty("--persona-gradient-from");
      document.documentElement.style.removeProperty("--persona-gradient-to");
    };
  }, [persona, primaryColor, secondaryColor]);

  // Provide persona via context
  return (
    <PersonaContext.Provider value={persona}>
      {children || null}
    </PersonaContext.Provider>
  );
}

