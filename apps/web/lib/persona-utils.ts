export type Persona = "student" | "parent" | "tutor";

/**
 * Persona metadata and configuration
 */
export interface PersonaConfig {
  name: string;
  icon: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  style: "playful" | "professional";
}

export const PERSONA_CONFIG: Record<Persona, PersonaConfig> = {
  student: {
    name: "Student",
    icon: "🎓",
    description: "I'm here to practice and learn",
    primaryColor: "#8B5CF6", // purple-500
    secondaryColor: "#EC4899", // pink-500
    accentColor: "#F59E0B", // amber-500
    style: "playful",
  },
  parent: {
    name: "Parent",
    icon: "👨‍👩‍👧‍👦",
    description: "I'm supporting my child's learning",
    primaryColor: "#3B82F6", // blue-500
    secondaryColor: "#06B6D4", // cyan-500
    accentColor: "#10B981", // green-500
    style: "professional",
  },
  tutor: {
    name: "Tutor",
    icon: "📚",
    description: "I'm teaching and creating content",
    primaryColor: "#10B981", // green-500
    secondaryColor: "#059669", // green-600
    accentColor: "#6366F1", // indigo-500
    style: "professional",
  },
};

/**
 * Get persona configuration
 */
export function getPersonaConfig(persona: Persona): PersonaConfig {
  return PERSONA_CONFIG[persona];
}

/**
 * Get persona display name
 */
export function getPersonaDisplayName(persona: Persona): string {
  return PERSONA_CONFIG[persona].name;
}

/**
 * Get persona icon emoji
 */
export function getPersonaIcon(persona: Persona): string {
  return PERSONA_CONFIG[persona].icon;
}

/**
 * Get persona primary color (hex)
 */
export function getPersonaPrimaryColor(persona: Persona): string {
  return PERSONA_CONFIG[persona].primaryColor;
}

/**
 * Get persona secondary color (hex)
 */
export function getPersonaSecondaryColor(persona: Persona): string {
  return PERSONA_CONFIG[persona].secondaryColor;
}

/**
 * Tailwind class helpers for persona-specific styling
 * 
 * Note: For most cases, use the CSS custom properties (--persona-primary, etc.)
 * These utilities are for when you need dynamic Tailwind classes
 */
export const PERSONA_TAILWIND_CLASSES: Record<Persona, {
  text: string;
  bg: string;
  border: string;
  ring: string;
}> = {
  student: {
    text: "text-purple-700 dark:text-purple-300",
    bg: "bg-purple-500",
    border: "border-purple-500",
    ring: "ring-purple-500",
  },
  parent: {
    text: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-500",
    border: "border-blue-500",
    ring: "ring-blue-500",
  },
  tutor: {
    text: "text-green-700 dark:text-green-300",
    bg: "bg-green-500",
    border: "border-green-500",
    ring: "ring-green-500",
  },
};

/**
 * Get Tailwind classes for persona
 */
export function getPersonaTailwindClasses(persona: Persona) {
  return PERSONA_TAILWIND_CLASSES[persona];
}

/**
 * Get gradient CSS for persona (for inline styles)
 */
export function getPersonaGradient(persona: Persona): string {
  const config = PERSONA_CONFIG[persona];
  return `linear-gradient(135deg, ${config.primaryColor} 0%, ${config.secondaryColor} 100%)`;
}

/**
 * Get CSS custom property value at runtime
 * Useful for JS animations or canvas rendering
 */
export function getPersonaCSSVar(varName: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

/**
 * Get all persona CSS vars as object (for JS use)
 */
export function getPersonaCSSVars(): {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
} {
  return {
    primary: getPersonaCSSVar("--persona-primary"),
    secondary: getPersonaCSSVar("--persona-secondary"),
    accent: getPersonaCSSVar("--persona-accent"),
    gradient: getPersonaCSSVar("--persona-gradient"),
  };
}

/**
 * Check if current persona is "playful" style
 */
export function isPlayfulPersona(persona: Persona): boolean {
  return PERSONA_CONFIG[persona].style === "playful";
}

/**
 * Check if current persona is "professional" style
 */
export function isProfessionalPersona(persona: Persona): boolean {
  return PERSONA_CONFIG[persona].style === "professional";
}

/**
 * Convert hex color to RGB string for CSS custom properties
 * @param hex - Hex color string (e.g., "#8B5CF6" or "8B5CF6")
 * @returns RGB string (e.g., "139 92 246") or empty string if invalid
 */
export function hexToRgb(hex: string): string {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, "");
  
  // Validate hex format
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    console.warn(`Invalid hex color: ${hex}`);
    return "";
  }
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);
  if (!result) return "";
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `${r} ${g} ${b}`;
}

