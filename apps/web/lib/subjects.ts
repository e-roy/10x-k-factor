/**
 * Centralized subject list for the application
 * Used in onboarding, profile settings, and demo pages
 */

export const SUBJECTS = [
  "Algebra",
  "Geometry",
  "Trigonometry",
  "Calculus",
  "Statistics",
  "Pre-Calculus",
  "Physics",
  "Chemistry",
  "Biology",
  "Earth Science",
  "English Literature",
  "English Writing",
  "World History",
  "US History",
  "Government",
  "Economics",
  "Spanish",
  "French",
  "Computer Science",
  "Art",
  "Music",
] as const;

export type Subject = typeof SUBJECTS[number];

/**
 * Format subject for display (capitalize properly)
 */
export function formatSubject(subject: string): string {
  return subject;
}

/**
 * Validate if a string is a valid subject
 */
export function isValidSubject(subject: string): subject is Subject {
  return SUBJECTS.includes(subject as Subject);
}

