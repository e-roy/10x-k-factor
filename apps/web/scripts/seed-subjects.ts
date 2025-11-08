/**
 * Seed script to populate subjects table with initial data
 * Run: pnpm tsx scripts/seed-subjects.ts
 */

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { db } from "../db/index";
import { subjects } from "../db/subjects-schema";
import { randomUUID } from "crypto";

// Load .env files (monorepo root and local)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, "../../../.env") });
config({ path: resolve(__dirname, "../../../.env.local") });
config({ path: resolve(__dirname, "../.env") });
config({ path: resolve(__dirname, "../.env.local") });

// Subject definitions with metadata
const SUBJECT_DEFINITIONS = [
  // Math subjects
  {
    name: "Algebra",
    slug: "algebra",
    description: "Learn fundamental algebraic concepts and problem-solving",
    icon: "calculator",
    color: "#8B5CF6",
    category: "Math",
    gradeLevel: "high-school",
  },
  {
    name: "Geometry",
    slug: "geometry",
    description: "Explore shapes, angles, and spatial reasoning",
    icon: "triangle",
    color: "#EC4899",
    category: "Math",
    gradeLevel: "high-school",
  },
  {
    name: "Trigonometry",
    slug: "trigonometry",
    description: "Master trigonometric functions and applications",
    icon: "waves",
    color: "#F59E0B",
    category: "Math",
    gradeLevel: "high-school",
  },
  {
    name: "Calculus",
    slug: "calculus",
    description: "Study limits, derivatives, and integrals",
    icon: "infinity",
    color: "#10B981",
    category: "Math",
    gradeLevel: "high-school",
  },
  {
    name: "Statistics",
    slug: "statistics",
    description: "Analyze data and understand probability",
    icon: "bar-chart",
    color: "#3B82F6",
    category: "Math",
    gradeLevel: "high-school",
  },
  {
    name: "Pre-Calculus",
    slug: "pre-calculus",
    description: "Build foundation for calculus concepts",
    icon: "sigma",
    color: "#6366F1",
    category: "Math",
    gradeLevel: "high-school",
  },

  // Science subjects
  {
    name: "Physics",
    slug: "physics",
    description: "Understand forces, energy, and the physical world",
    icon: "atom",
    color: "#EF4444",
    category: "Science",
    gradeLevel: "high-school",
  },
  {
    name: "Chemistry",
    slug: "chemistry",
    description: "Explore matter, reactions, and molecular structures",
    icon: "flask-conical",
    color: "#06B6D4",
    category: "Science",
    gradeLevel: "high-school",
  },
  {
    name: "Biology",
    slug: "biology",
    description: "Study living organisms and life processes",
    icon: "leaf",
    color: "#10B981",
    category: "Science",
    gradeLevel: "high-school",
  },
  {
    name: "Earth Science",
    slug: "earth-science",
    description: "Learn about geology, weather, and our planet",
    icon: "globe",
    color: "#14B8A6",
    category: "Science",
    gradeLevel: "high-school",
  },

  // Language Arts
  {
    name: "English Literature",
    slug: "english-literature",
    description: "Analyze texts, themes, and literary devices",
    icon: "book-open",
    color: "#8B5CF6",
    category: "Language Arts",
    gradeLevel: "high-school",
  },
  {
    name: "English Writing",
    slug: "english-writing",
    description: "Develop writing skills and composition techniques",
    icon: "pen-tool",
    color: "#6366F1",
    category: "Language Arts",
    gradeLevel: "high-school",
  },

  // Social Studies
  {
    name: "World History",
    slug: "world-history",
    description: "Explore global historical events and civilizations",
    icon: "landmark",
    color: "#F59E0B",
    category: "Social Studies",
    gradeLevel: "high-school",
  },
  {
    name: "US History",
    slug: "us-history",
    description: "Study American history and its impact",
    icon: "flag",
    color: "#DC2626",
    category: "Social Studies",
    gradeLevel: "high-school",
  },
  {
    name: "Government",
    slug: "government",
    description: "Understand political systems and civic engagement",
    icon: "building-2",
    color: "#7C3AED",
    category: "Social Studies",
    gradeLevel: "high-school",
  },
  {
    name: "Economics",
    slug: "economics",
    description: "Learn about markets, trade, and economic systems",
    icon: "trending-up",
    color: "#059669",
    category: "Social Studies",
    gradeLevel: "high-school",
  },

  // Foreign Languages
  {
    name: "Spanish",
    slug: "spanish",
    description: "Learn Spanish language and culture",
    icon: "languages",
    color: "#EF4444",
    category: "Foreign Language",
    gradeLevel: "high-school",
  },
  {
    name: "French",
    slug: "french",
    description: "Learn French language and culture",
    icon: "languages",
    color: "#3B82F6",
    category: "Foreign Language",
    gradeLevel: "high-school",
  },

  // Other
  {
    name: "Computer Science",
    slug: "computer-science",
    description: "Learn programming and computational thinking",
    icon: "code",
    color: "#06B6D4",
    category: "Technology",
    gradeLevel: "high-school",
  },
  {
    name: "Art",
    slug: "art",
    description: "Explore visual arts and creative expression",
    icon: "palette",
    color: "#EC4899",
    category: "Arts",
    gradeLevel: "high-school",
  },
  {
    name: "Music",
    slug: "music",
    description: "Study music theory, history, and performance",
    icon: "music",
    color: "#8B5CF6",
    category: "Arts",
    gradeLevel: "high-school",
  },
];

async function seedSubjects() {
  try {
    console.log("🌱 Seeding subjects...");

    // Insert all subjects
    for (const subject of SUBJECT_DEFINITIONS) {
      await db
        .insert(subjects)
        .values({
          id: randomUUID(),
          ...subject,
          active: true,
          enrollmentCount: 0,
        })
        .onConflictDoNothing(); // Skip if already exists (by unique name or slug)
    }

    console.log(`✅ Successfully seeded ${SUBJECT_DEFINITIONS.length} subjects!`);

    // Verify
    const allSubjects = await db.select().from(subjects);
    console.log(`📊 Total subjects in database: ${allSubjects.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding subjects:", error);
    process.exit(1);
  }
}

seedSubjects();

