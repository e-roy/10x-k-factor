export interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number; // 0-based index of correct option
}

export interface Deck {
  id: string;
  subject: string;
  questions: Question[];
}

// Mock deck data - in production this would come from a database
const mockDecks: Deck[] = [
  {
    id: "deck-1",
    subject: "algebra",
    questions: [
      {
        id: "q1",
        question: "What is the value of x in 2x + 5 = 15?",
        options: ["x = 3", "x = 5", "x = 7", "x = 10"],
        correct: 1,
      },
      {
        id: "q2",
        question: "Simplify: 3(x + 4) - 2x",
        options: ["x + 12", "x + 4", "5x + 12", "3x + 10"],
        correct: 0,
      },
      {
        id: "q3",
        question: "What is the slope of the line y = -2x + 3?",
        options: ["-2", "2", "3", "-3"],
        correct: 0,
      },
      {
        id: "q4",
        question: "Solve for y: 4y - 8 = 12",
        options: ["y = 1", "y = 5", "y = 4", "y = 6"],
        correct: 1,
      },
      {
        id: "q5",
        question: "Factor: x² - 9",
        options: ["(x - 3)(x + 3)", "(x - 9)(x + 1)", "(x - 3)²", "(x + 3)²"],
        correct: 0,
      },
    ],
  },
  {
    id: "deck-default",
    subject: "math",
    questions: [
      {
        id: "q1",
        question: "What is 15 × 4?",
        options: ["50", "60", "70", "80"],
        correct: 1,
      },
      {
        id: "q2",
        question: "What is the square root of 64?",
        options: ["6", "7", "8", "9"],
        correct: 2,
      },
      {
        id: "q3",
        question: "What is 25% of 80?",
        options: ["15", "20", "25", "30"],
        correct: 1,
      },
      {
        id: "q4",
        question: "What is the area of a rectangle with length 6 and width 4?",
        options: ["20", "24", "28", "32"],
        correct: 1,
      },
      {
        id: "q5",
        question: "What is 3³?",
        options: ["9", "18", "27", "36"],
        correct: 2,
      },
    ],
  },
];

/**
 * Get deck by ID, returns null if not found
 */
export function getDeck(deckId: string): Deck | null {
  return mockDecks.find((d) => d.id === deckId) || null;
}

/**
 * Get all available deck IDs
 */
export function getDeckIds(): string[] {
  return mockDecks.map((d) => d.id);
}
