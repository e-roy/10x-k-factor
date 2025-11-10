"use server";

import { db } from "@/db/index";
import { users } from "@/db/auth-schema";
import { usersProfiles } from "@/db/user-schema";
import { results } from "@/db/learning-schema";
import {
  referrals,
  subjects,
  userSubjects,
  xpEvents,
} from "@/db/schema/index";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";
import { z } from "zod";
import { eq, inArray, sql, and } from "drizzle-orm";
import type { Persona } from "@/db/types";

// Realistic name pools for demo data
const FIRST_NAMES = [
  "Alex",
  "Jordan",
  "Taylor",
  "Morgan",
  "Casey",
  "Riley",
  "Avery",
  "Quinn",
  "Sage",
  "River",
  "Skyler",
  "Phoenix",
  "Rowan",
  "Blake",
  "Cameron",
  "Dakota",
  "Jamie",
  "Kai",
  "Logan",
  "Noah",
  "Emma",
  "Olivia",
  "Sophia",
  "Isabella",
  "Mia",
  "Charlotte",
  "Amelia",
  "Harper",
  "Evelyn",
  "Abigail",
  "Emily",
  "Elizabeth",
  "Sofia",
  "Avery",
  "Ella",
  "Madison",
  "Scarlett",
  "Victoria",
  "Aria",
  "Grace",
  "Chloe",
  "Lily",
  "Natalie",
  "Zoe",
  "Hannah",
  "Lillian",
  "Addison",
  "Eleanor",
  "Aubrey",
  "Layla",
  "Zoey",
  "Penelope",
  "Riley",
  "Leah",
  "Audrey",
  "Savannah",
  "Allison",
  "Samantha",
  "Nora",
  "Skylar",
  "Camila",
  "Anna",
  "Paisley",
  "Ariana",
  "Ellie",
  "Aaliyah",
  "Claire",
  "Violet",
  "Stella",
  "Lucy",
  "Paisley",
  "Bella",
  "Caroline",
  "Genesis",
  "Alyssa",
  "Kennedy",
  "Kinsley",
  "Allison",
  "Maya",
  "Willow",
  "Naomi",
  "Elena",
  "Sarah",
  "Arianna",
  "Alice",
  "Madelyn",
  "Cora",
  "Ruby",
  "Eva",
  "Serenity",
  "Autumn",
  "Adeline",
  "Hailey",
  "Gianna",
  "Valentina",
  "Isla",
  "Eliana",
  "Quinn",
  "Nevaeh",
  "Ivy",
  "Sadie",
  "Piper",
  "Lydia",
  "Alexa",
  "Joseph",
  "Michael",
  "William",
  "James",
  "Benjamin",
  "Lucas",
  "Henry",
  "Alexander",
  "Mason",
  "Ethan",
  "Daniel",
  "Matthew",
  "Aiden",
  "Jackson",
  "Sebastian",
  "David",
  "Carter",
  "Wyatt",
  "Jayden",
  "John",
  "Owen",
  "Dylan",
  "Luke",
  "Gabriel",
  "Anthony",
  "Isaac",
  "Grayson",
  "Jack",
  "Julian",
  "Levi",
  "Christopher",
  "Joshua",
  "Andrew",
  "Lincoln",
  "Mateo",
  "Ryan",
  "Jaxon",
  "Nathan",
  "Aaron",
  "Eli",
  "Hunter",
  "Connor",
  "Landon",
  "Adrian",
  "Asher",
  "Jonathan",
  "Caleb",
  "Jace",
  "Thomas",
  "Jeremiah",
  "Easton",
  "Hudson",
  "Robert",
  "Nolan",
  "Nicholas",
  "Ezra",
  "Colton",
  "Angel",
  "Brayden",
  "Jordan",
  "Dominic",
  "Austin",
  "Ian",
  "Adam",
  "Elias",
  "Jaxson",
  "Greyson",
  "Jose",
  "Ezekiel",
  "Carson",
  "Evan",
  "Maverick",
  "Bryson",
  "Jaxon",
  "Cooper",
  "Jason",
  "Parker",
  "Xavier",
  "Roman",
  "Kevin",
  "Bentley",
  "Tristan",
  "Damian",
  "Ashton",
  "Vincent",
  "Preston",
  "Kaleb",
  "Ryder",
];

const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
  "Gomez",
  "Phillips",
  "Evans",
  "Turner",
  "Diaz",
  "Parker",
  "Cruz",
  "Edwards",
  "Collins",
  "Reyes",
  "Stewart",
  "Morris",
  "Morales",
  "Murphy",
  "Cook",
  "Rogers",
  "Gutierrez",
  "Ortiz",
  "Morgan",
  "Cooper",
  "Peterson",
  "Bailey",
  "Reed",
  "Kelly",
  "Howard",
  "Ramos",
  "Kim",
  "Cox",
  "Ward",
  "Richardson",
  "Watson",
  "Brooks",
  "Chavez",
  "Wood",
  "James",
  "Bennett",
  "Gray",
  "Mendoza",
  "Ruiz",
  "Hughes",
  "Price",
  "Alvarez",
  "Castillo",
  "Sanders",
  "Patel",
  "Myers",
  "Long",
  "Ross",
  "Foster",
  "Jimenez",
  "Powell",
  "Jenkins",
  "Perry",
  "Russell",
  "Sullivan",
  "Bell",
  "Coleman",
  "Butler",
  "Henderson",
  "Barnes",
  "Gonzales",
  "Fisher",
  "Vasquez",
  "Simmons",
  "Romero",
  "Jordan",
  "Patterson",
  "Alexander",
  "Hamilton",
  "Graham",
  "Reynolds",
  "Griffin",
  "Wallace",
  "Moreno",
  "West",
  "Cole",
  "Hayes",
  "Bryant",
  "Herrera",
  "Gibson",
  "Ellis",
  "Tran",
  "Medina",
  "Aguilar",
  "Stevens",
  "Murray",
  "Ford",
  "Castro",
  "Marshall",
  "Owens",
  "Harrison",
  "Fernandez",
  "Mcdonald",
  "Woods",
  "Washington",
  "Kennedy",
  "Wells",
  "Vargas",
  "Henry",
  "Chen",
  "Freeman",
  "Webb",
  "Tucker",
  "Guzman",
  "Burns",
  "Crawford",
  "Olson",
  "Simpson",
  "Porter",
  "Hunter",
  "Gordon",
  "Mendez",
  "Silva",
  "Shaw",
  "Snyder",
  "Mason",
  "Dixon",
  "Munoz",
  "Hunt",
  "Hicks",
  "Holmes",
  "Palmer",
  "Wagner",
  "Black",
  "Robertson",
  "Boyd",
  "Rose",
  "Stone",
  "Salazar",
  "Fox",
  "Warren",
  "Mills",
  "Meyer",
  "Rice",
  "Schmidt",
  "Garza",
  "Daniels",
  "Ferguson",
  "Nichols",
  "Stephens",
  "Soto",
  "Weaver",
  "Ryan",
  "Gardner",
  "Payne",
  "Grant",
  "Dunn",
  "Kelley",
  "Spencer",
  "Hawkins",
  "Arnold",
  "Pierce",
  "Vazquez",
  "Hansen",
  "Peters",
  "Santos",
  "Hart",
  "Bradley",
  "Knight",
  "Elliott",
  "Cunningham",
  "Duncan",
  "Armstrong",
  "Hudson",
  "Carroll",
  "Lane",
  "Riley",
  "Andrews",
  "Alvarado",
  "Ray",
  "Delgado",
  "Berry",
  "Perkins",
  "Hoffman",
  "Johnston",
  "Matthews",
  "Pena",
  "Richards",
  "Contreras",
  "Willis",
  "Carpenter",
  "Lawrence",
  "Sandoval",
  "Guerrero",
  "George",
  "Chapman",
  "Rios",
  "Estrada",
  "Ortega",
  "Watkins",
  "Greene",
  "Nunez",
  "Wheeler",
  "Valdez",
  "Harper",
  "Lynch",
  "Barker",
  "Maldonado",
  "Zimmerman",
  "Paul",
  "Potter",
  "Obrien",
  "Casey",
  "Mccarthy",
  "Lucero",
  "Hodge",
  "Merritt",
  "Mata",
  "Strickland",
  "Anthony",
  "Cisneros",
  "Bond",
  "Kerr",
  "Duffy",
  "Valenzuela",
  "Ayala",
  "Valentine",
  "Mejia",
  "Gaines",
  "Horton",
  "Sheppard",
  "Berg",
  "Schroeder",
  "Fields",
  "Wiley",
  "Buck",
  "Glass",
  "Morton",
  "Singleton",
  "Briggs",
  "Parsons",
  "Mcintosh",
  "Dorsey",
  "Pineda",
  "Galloway",
  "Booth",
  "Kane",
  "Patton",
  "Lyons",
  "Cline",
  "Navarro",
  "Harrell",
  "Forbes",
  "Delacruz",
  "Colon",
  "Chandler",
  "Ingram",
  "Terry",
  "Hutchinson",
  "Brennan",
  "Cannon",
  "Cantrell",
  "Atkins",
  "Merritt",
  "Huffman",
  "Boyle",
  "Mayer",
  "Coffey",
  "Marsh",
  "Roach",
  "Joyce",
  "Vincent",
  "Frost",
  "Brady",
  "Andersen",
  "Workman",
  "Finley",
  "Mccall",
  "Gill",
  "Juarez",
  "Hoover",
  "Ware",
  "Brewer",
  "Barrera",
  "Orr",
  "Jacobson",
  "Gay",
  "Garner",
  "Acosta",
  "Franco",
  "Shields",
  "Rubio",
  "Wolf",
  "Chandler",
  "Daniel",
  "Norris",
  "Mccullough",
  "Holloway",
  "Floyd",
  "Hartman",
  "Brock",
  "Shaffer",
  "Doyle",
  "Sherman",
  "Saunders",
  "Wise",
  "Colon",
  "Gill",
  "Alvarado",
  "Greer",
  "Padilla",
  "Simon",
  "Waters",
  "Nunez",
  "Ballard",
  "Schwartz",
  "Mcbride",
  "Houston",
  "Christensen",
  "Klein",
  "Pratt",
  "Briggs",
  "Parsons",
  "Mclaughlin",
  "Zimmerman",
  "French",
  "Buchanan",
  "Moran",
  "Copeland",
  "Roy",
  "Pittman",
  "Brady",
  "Mccormick",
  "Holloway",
  "Brock",
  "Poole",
  "Frank",
  "Logan",
  "Owen",
  "Bass",
  "Marsh",
  "Drake",
  "Wong",
  "Jefferson",
  "Park",
  "Morton",
  "Abbott",
  "Sparks",
  "Patrick",
  "Norton",
  "Huff",
  "Clayton",
  "Massey",
  "Lloyd",
  "Figueroa",
  "Carson",
  "Bowers",
  "Roberson",
  "Barton",
  "Tran",
  "Lamb",
  "Harrington",
  "Casey",
  "Boone",
  "Cortez",
  "Clarke",
  "Mathis",
  "Singleton",
  "Wilkins",
  "Cain",
  "Bryan",
  "Underwood",
  "Hogan",
  "Mckenzie",
  "Collier",
  "Luna",
  "Phelps",
  "Mcguire",
  "Allison",
  "Bridges",
  "Wilkerson",
  "Nash",
  "Summers",
  "Atkins",
  "Wilcox",
  "Pitts",
  "Conley",
  "Marquez",
  "Burnett",
  "Richard",
  "Cochran",
  "Chase",
  "Davenport",
  "Hood",
  "Gates",
  "Clay",
  "Ayala",
  "Sawyer",
  "Roman",
  "Vazquez",
  "Dickerson",
  "Hodge",
  "Acosta",
  "Flynn",
  "Espinoza",
  "Nicholson",
  "Monroe",
  "Wolf",
  "Morrow",
  "Kirk",
  "Randall",
  "Anthony",
  "Whitaker",
  "Oconnor",
  "Skinner",
  "Ware",
  "Molina",
  "Kirby",
  "Huffman",
  "Fleming",
  "Hull",
  "Dickerson",
  "Curry",
  "Powers",
  "Schultz",
  "Walters",
  "Reid",
  "Willis",
  "Gilmore",
  "Benson",
  "Sharp",
  "Bowen",
  "Daniel",
  "Barber",
  "Cummings",
  "Hines",
  "Baldwin",
  "Griffith",
  "Valdez",
  "Hubbard",
  "Salinas",
  "Reeves",
  "Warner",
  "Stevenson",
  "Burgess",
  "Santos",
  "Tate",
  "Cross",
  "Garner",
  "Mann",
  "Mack",
  "Moss",
  "Thornton",
  "Dennis",
  "Mcgee",
  "Farmer",
  "Delgado",
  "Aguilar",
  "Vega",
  "Glover",
  "Manning",
  "Cohen",
  "Harmon",
  "Rodgers",
  "Robbins",
  "Newton",
  "Todd",
  "Blair",
  "Higgins",
  "Ingram",
  "Reese",
  "Cannon",
  "Strickland",
  "Townsend",
  "Potter",
  "Goodwin",
  "Walton",
  "Rowe",
  "Hampton",
  "Ortega",
  "Patton",
  "Swanson",
  "Joseph",
  "Francis",
  "Goodman",
  "Maldonado",
  "Yates",
  "Becker",
  "Erickson",
  "Hodges",
  "Rios",
  "Conner",
  "Adkins",
  "Webster",
  "Norman",
  "Horton",
  "Adkins",
  "Terry",
  "Conrad",
  "Gould",
  "Choi",
  "Moon",
  "Mccarty",
  "Pollard",
  "Melton",
  "Oconnell",
  "Lester",
  "Dillard",
  "Pollard",
  "Melton",
  "Oconnell",
  "Lester",
  "Dillard",
];

const seedSchema = z.object({
  userCount: z.number().int().min(0).max(50).default(5), // 0 means don't create users
  resultsPerUser: z.number().int().min(0).max(20).default(3), // 0 means don't create results
  subjects: z.string().min(1), // Comma-separated subjects
  scoreMin: z.number().int().min(0).max(100).default(60),
  scoreMax: z.number().int().min(0).max(100).default(100),
  // Advanced options
  selectedUserIds: z.array(z.string()).optional(), // Specific user IDs to use for advanced options (if provided, uses existing users)
  createParents: z.boolean().default(false),
  createSubjectEnrollments: z.boolean().default(false),
  createXpEvents: z.boolean().default(false),
  createReferrals: z.boolean().default(false),
  // Numeric options
  xpEventsPerUser: z.number().int().min(1).max(50).default(5),
  referralCount: z.number().int().min(1).max(20).default(3),
});

export interface SeedResult {
  success: boolean;
  usersCreated: number;
  resultsCreated: number;
  parentsCreated?: number;
  enrollmentsCreated?: number;
  xpEventsCreated?: number;
  referralsCreated?: number;
  existingUsersUsed?: number;
  error?: string;
}

/**
 * Seed users and results for leaderboard testing
 * Only accessible to admins
 */
export async function seedUsersAndResults(
  input: z.infer<typeof seedSchema>
): Promise<SeedResult> {
  try {
    // Check admin role
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return {
        success: false,
        usersCreated: 0,
        resultsCreated: 0,
        parentsCreated: 0,
        enrollmentsCreated: 0,
        xpEventsCreated: 0,
        referralsCreated: 0,
        error: "Unauthorized: Admin access required",
      };
    }

    // Validate input
    const validated = seedSchema.parse(input);

    // Parse subjects (comma-separated, trim whitespace)
    const subjectList = validated.subjects
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length <= 64);

    if (subjectList.length === 0) {
      return {
        success: false,
        usersCreated: 0,
        resultsCreated: 0,
        parentsCreated: 0,
        enrollmentsCreated: 0,
        xpEventsCreated: 0,
        referralsCreated: 0,
        error: "At least one valid subject is required",
      };
    }

    // Ensure scoreMin <= scoreMax
    const scoreMin = Math.min(validated.scoreMin, validated.scoreMax);
    const scoreMax = Math.max(validated.scoreMin, validated.scoreMax);

    const timestamp = Date.now();
    const usersToCreate = [];
    const profilesToCreate = [];
    const resultsToCreate = [];
    // Track used names to avoid duplicates (shared between students and parents)
    const usedNames = new Set<string>();
    // Track used emails to ensure uniqueness
    const usedEmails = new Set<string>();

    // Get existing users if selected, otherwise create new ones
    let studentUserIds: string[] = [];

    if (validated.selectedUserIds && validated.selectedUserIds.length > 0) {
      // Use specifically selected users
      // Validate that these users exist and are students
      const selectedUsers = await db
        .select({ id: users.id })
        .from(users)
        .innerJoin(usersProfiles, eq(users.id, usersProfiles.userId))
        .where(
          and(
            eq(usersProfiles.persona, "student"),
            inArray(users.id, validated.selectedUserIds)
          )
        );

      if (selectedUsers.length === 0) {
        return {
          success: false,
          usersCreated: 0,
          resultsCreated: 0,
          parentsCreated: 0,
          enrollmentsCreated: 0,
          xpEventsCreated: 0,
          referralsCreated: 0,
          error: "Selected users not found or are not students. Please select valid users.",
        };
      }

      studentUserIds = selectedUsers.map((s) => s.id);
    } else if (validated.userCount > 0) {
      // Create new users
      // Generate users with realistic names and varied result counts
      for (let i = 0; i < validated.userCount; i++) {
        const userId = randomUUID();

        // Generate unique realistic name
        let firstName: string;
        let lastName: string;
        let fullName: string;
        let attempts = 0;
        do {
          firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
          lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
          fullName = `${firstName} ${lastName}`;
          attempts++;
        } while (usedNames.has(fullName) && attempts < 100);
        usedNames.add(fullName);

        // Generate unique email
        let email = `${firstName.toLowerCase()}@mail.com`;
        let emailCounter = 1;
        while (usedEmails.has(email)) {
          email = `${firstName.toLowerCase()}${emailCounter}@mail.com`;
          emailCounter++;
        }
        usedEmails.add(email);

        usersToCreate.push({
          id: userId,
          name: fullName,
          email,
          createdAt: new Date(),
        });

        profilesToCreate.push({
          userId,
          persona: "student" as Persona,
          minor: false,
          guardianId: null,
          onboardingCompleted: true,
          createdAt: new Date(),
        });

        // Generate results only if resultsPerUser > 0
        if (validated.resultsPerUser > 0) {
          // Generate varied number of results per user for realistic leaderboard spread
          // Create a distribution: some users with many results (top performers),
          // some with average, some with fewer
          let resultCount: number;
          if (i < Math.floor(validated.userCount * 0.2)) {
            // Top 20%: high performers (2-3x average)
            resultCount = Math.floor(
              validated.resultsPerUser * (2 + Math.random())
            );
          } else if (i < Math.floor(validated.userCount * 0.5)) {
            // Next 30%: above average (1.5-2x average)
            resultCount = Math.floor(
              validated.resultsPerUser * (1.5 + Math.random() * 0.5)
            );
          } else if (i < Math.floor(validated.userCount * 0.8)) {
            // Next 30%: average (0.8-1.2x average)
            resultCount = Math.floor(
              validated.resultsPerUser * (0.8 + Math.random() * 0.4)
            );
          } else {
            // Bottom 20%: fewer results (0.5-0.8x average, minimum 1)
            resultCount = Math.max(
              1,
              Math.floor(validated.resultsPerUser * (0.5 + Math.random() * 0.3))
            );
          }

          // Generate results for this user
          // Distribute results across subjects with some users focusing on specific subjects
          for (let j = 0; j < resultCount; j++) {
            // Some users focus on one subject (70% chance), others spread across subjects
            const subject =
              j === 0 && Math.random() < 0.7
                ? subjectList[Math.floor(Math.random() * subjectList.length)]
                : subjectList[j % subjectList.length];

            const score = Math.floor(
              Math.random() * (scoreMax - scoreMin + 1) + scoreMin
            );

            resultsToCreate.push({
              id: randomUUID(),
              userId,
              subject,
              score,
              metadata: {
                seeded: true,
                seedTimestamp: timestamp,
              },
              createdAt: new Date(),
            });
          }
        }
      }

      // Insert users
      if (usersToCreate.length > 0) {
        await db.insert(users).values(usersToCreate);
      }

      // Insert profiles
      if (profilesToCreate.length > 0) {
        await db.insert(usersProfiles).values(profilesToCreate);
      }

      // Insert results
      if (resultsToCreate.length > 0) {
        await db.insert(results).values(resultsToCreate);
      }

      // Get all created student user IDs
      studentUserIds = usersToCreate.map((u) => u.id);
    }

    // Track created counts
    let parentsCreated = 0;
    let enrollmentsCreated = 0;
    let xpEventsCreated = 0;
    let referralsCreated = 0;

    // Validate we have users to work with for advanced options
    if (studentUserIds.length === 0 && (validated.createParents || validated.createSubjectEnrollments || validated.createXpEvents || validated.createReferrals)) {
      return {
        success: false,
        usersCreated: usersToCreate.length,
        resultsCreated: resultsToCreate.length,
        parentsCreated: 0,
        enrollmentsCreated: 0,
        xpEventsCreated: 0,
        referralsCreated: 0,
        error: "No users available for advanced options. Please create users or select existing users.",
      };
    }

    // 1. Create parents and link students
    if (validated.createParents && studentUserIds.length > 0) {
      const parentCount = Math.ceil(studentUserIds.length / 1.5);
      const parentsToCreate = [];
      const parentProfilesToCreate = [];
      const parentIds: string[] = [];

      for (let i = 0; i < parentCount; i++) {
        const parentId = randomUUID();
        parentIds.push(parentId);

        let firstName: string;
        let lastName: string;
        let fullName: string;
        let attempts = 0;
        do {
          firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
          lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
          fullName = `${firstName} ${lastName}`;
          attempts++;
        } while (usedNames.has(fullName) && attempts < 100);
        usedNames.add(fullName);

        // Generate unique email
        let email = `${firstName.toLowerCase()}@mail.com`;
        let emailCounter = 1;
        while (usedEmails.has(email)) {
          email = `${firstName.toLowerCase()}${emailCounter}@mail.com`;
          emailCounter++;
        }
        usedEmails.add(email);

        parentsToCreate.push({
          id: parentId,
          name: fullName,
          email,
          createdAt: new Date(),
        });

        parentProfilesToCreate.push({
          userId: parentId,
          persona: "parent" as Persona,
          minor: false,
          guardianId: null,
          onboardingCompleted: true,
          createdAt: new Date(),
        });
      }

      if (parentsToCreate.length > 0) {
        await db.insert(users).values(parentsToCreate);
        await db.insert(usersProfiles).values(parentProfilesToCreate);
        parentsCreated = parentsToCreate.length;

        // Assign 1-2 students to each parent
        const shuffledStudents = [...studentUserIds].sort(
          () => Math.random() - 0.5
        );
        let studentIndex = 0;

        for (const parentId of parentIds) {
          const studentsForParent = Math.min(
            Math.random() < 0.5 ? 1 : 2,
            shuffledStudents.length - studentIndex
          );

          for (let j = 0; j < studentsForParent && studentIndex < shuffledStudents.length; j++) {
            const studentId = shuffledStudents[studentIndex];
            const isMinor = Math.random() < 0.4; // 40% chance of being minor

            // Update student profile with guardian
            await db
              .update(usersProfiles)
              .set({
                guardianId: parentId,
                minor: isMinor,
              })
              .where(eq(usersProfiles.userId, studentId));

            studentIndex++;
          }
        }
      }
    }

    // 2. Create subject enrollments
    if (validated.createSubjectEnrollments && studentUserIds.length > 0) {
      // Ensure subjects exist
      const existingSubjects = await db
        .select()
        .from(subjects)
        .where(inArray(subjects.slug, subjectList));

      const existingSlugs = new Set(existingSubjects.map((s) => s.slug));
      const subjectsToCreate = [];

      for (const subjectSlug of subjectList) {
        if (!existingSlugs.has(subjectSlug)) {
          const subjectId = randomUUID();
          subjectsToCreate.push({
            id: subjectId,
            name:
              subjectSlug.charAt(0).toUpperCase() + subjectSlug.slice(1),
            slug: subjectSlug,
            active: true,
            enrollmentCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      if (subjectsToCreate.length > 0) {
        await db.insert(subjects).values(subjectsToCreate);
      }

      // Get all subject IDs (existing + newly created)
      const allSubjects = await db
        .select()
        .from(subjects)
        .where(inArray(subjects.slug, subjectList));

      const subjectIdMap = new Map(
        allSubjects.map((s) => [s.slug, s.id])
      );

      // Enroll students in 2-4 random subjects
      const enrollmentsToCreate = [];
      const now = new Date();

      for (const studentId of studentUserIds) {
        const enrollmentCount = Math.floor(Math.random() * 3) + 2; // 2-4
        const shuffledSubjects = [...subjectList].sort(
          () => Math.random() - 0.5
        );
        const selectedSubjects = shuffledSubjects.slice(0, enrollmentCount);

        for (const subjectSlug of selectedSubjects) {
          const subjectId = subjectIdMap.get(subjectSlug);
          if (!subjectId) continue;

          const progress = Math.floor(Math.random() * 101); // 0-100
          const streak = Math.floor(Math.random() * 15); // 0-14
          const totalXp = Math.floor(Math.random() * 500) + 50; // 50-550
          const daysAgo = Math.floor(Math.random() * 7); // 0-6 days ago
          const lastActivity = new Date(now);
          lastActivity.setDate(lastActivity.getDate() - daysAgo);

          enrollmentsToCreate.push({
            userId: studentId,
            subjectId,
            progress,
            sessionsCompleted: Math.floor(Math.random() * 20),
            totalXp,
            currentStreak: streak,
            longestStreak: Math.max(streak, Math.floor(Math.random() * 20)),
            lastActivityAt: lastActivity,
            enrolledAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
            favorite: Math.random() < 0.2, // 20% chance
            notificationsEnabled: true,
          });
        }
      }

      if (enrollmentsToCreate.length > 0) {
        await db.insert(userSubjects).values(enrollmentsToCreate);
        enrollmentsCreated = enrollmentsToCreate.length;

        // Update enrollment counts
        for (const subject of allSubjects) {
          const count = enrollmentsToCreate.filter(
            (e) => e.subjectId === subject.id
          ).length;
          if (count > 0) {
            await db.execute(sql`
              UPDATE subjects
              SET enrollment_count = enrollment_count + ${count}
              WHERE id = ${subject.id}
            `);
          }
        }
      }
    }

    // 4. Create XP events
    if (validated.createXpEvents && studentUserIds.length > 0) {
      const eventTypes = [
        "challenge.completed",
        "challenge.perfect",
        "challenge.streak_kept",
        "invite.sent",
        "invite.accepted",
        "invitee.fvm_reached",
        "results.viewed",
        "presence.session_minute",
        "session.tutor_5star",
      ];

      const xpEventsToCreate = [];
      const now = new Date();

      for (const studentId of studentUserIds) {
        for (let i = 0; i < validated.xpEventsPerUser; i++) {
          const eventType =
            eventTypes[Math.floor(Math.random() * eventTypes.length)];
          const daysAgo = Math.floor(Math.random() * 30); // 0-29 days ago
          const createdAt = new Date(now);
          createdAt.setDate(createdAt.getDate() - daysAgo);
          createdAt.setHours(
            Math.floor(Math.random() * 24),
            Math.floor(Math.random() * 60)
          );

          xpEventsToCreate.push({
            userId: studentId,
            personaType: "student" as Persona,
            eventType,
            referenceId: randomUUID().slice(0, 12),
            rawXp: Math.floor(Math.random() * 30) + 1, // 1-30
            metadata: {
              seeded: true,
              seedTimestamp: timestamp,
            },
            createdAt,
          });
        }
      }

      if (xpEventsToCreate.length > 0) {
        await db.insert(xpEvents).values(xpEventsToCreate);
        xpEventsCreated = xpEventsToCreate.length;
      }
    }

    // 5. Create referrals
    if (validated.createReferrals && studentUserIds.length >= 2) {
      const loops = ["buddy_challenge", "tutor_spotlight", "results_share"];
      const referralsToCreate = [];
      const maxReferrals = Math.min(
        validated.referralCount,
        Math.floor(studentUserIds.length / 2)
      );

      // Create unique pairs
      const usedPairs = new Set<string>();
      let created = 0;
      const now = new Date();

      while (created < maxReferrals && usedPairs.size < studentUserIds.length * (studentUserIds.length - 1) / 2) {
        const inviterId =
          studentUserIds[Math.floor(Math.random() * studentUserIds.length)];
        let inviteeId =
          studentUserIds[Math.floor(Math.random() * studentUserIds.length)];

        // Ensure inviter and invitee are different
        while (inviteeId === inviterId) {
          inviteeId =
            studentUserIds[Math.floor(Math.random() * studentUserIds.length)];
        }

        const pairKey = [inviterId, inviteeId].sort().join("-");
        if (usedPairs.has(pairKey)) continue;

        usedPairs.add(pairKey);

        const loop = loops[Math.floor(Math.random() * loops.length)];
        const completed = Math.random() < 0.6; // 60% completed
        const rewarded = completed && Math.random() < 0.8; // 80% of completed get rewards

        const daysAgo = Math.floor(Math.random() * 14); // 0-13 days ago
        const createdAt = new Date(now);
        createdAt.setDate(createdAt.getDate() - daysAgo);

        const completedAt = completed
          ? new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000)
          : null;

        referralsToCreate.push({
          id: randomUUID(),
          inviterId,
          inviteeId,
          smartLinkCode: randomUUID().slice(0, 12),
          loop,
          inviteeCompletedAction: completed,
          inviterRewarded: rewarded,
          inviteeRewarded: rewarded,
          metadata: {
            seeded: true,
            seedTimestamp: timestamp,
            inviteeScore: completed ? Math.floor(Math.random() * 41) + 60 : undefined,
            conversionTimeMs: completed
              ? Math.floor(Math.random() * 3600000) + 60000
              : undefined,
          },
          createdAt,
          completedAt,
          rewardedAt: rewarded ? completedAt : null,
        });

        created++;
      }

      if (referralsToCreate.length > 0) {
        await db.insert(referrals).values(referralsToCreate);
        referralsCreated = referralsToCreate.length;
      }
    }

    return {
      success: true,
      usersCreated: usersToCreate.length,
      resultsCreated: resultsToCreate.length,
      parentsCreated,
      enrollmentsCreated,
      xpEventsCreated,
      referralsCreated,
      existingUsersUsed: validated.selectedUserIds && validated.selectedUserIds.length > 0 ? studentUserIds.length : undefined,
    };
  } catch (error) {
    console.error("[seed] Error seeding data:", error);
    return {
      success: false,
      usersCreated: 0,
      resultsCreated: 0,
      parentsCreated: 0,
      enrollmentsCreated: 0,
      xpEventsCreated: 0,
      referralsCreated: 0,
      error:
        error instanceof Error
          ? error.message
          : "Failed to seed data. Check server logs.",
    };
  }
}

/**
 * Quick seed - creates 15 users with varied results for realistic demo leaderboard
 * Creates a good spread: top performers, average users, and beginners
 * Enables all advanced options for comprehensive demo data
 */
export async function quickSeed(): Promise<SeedResult> {
  return seedUsersAndResults({
    userCount: 15,
    resultsPerUser: 5, // Average - will be varied in the function
    subjects: "algebra,geometry,calculus,physics,chemistry",
    scoreMin: 60,
    scoreMax: 100,
    selectedUserIds: undefined,
    createParents: true,
    createSubjectEnrollments: true,
    createXpEvents: true,
    createReferrals: true,
    xpEventsPerUser: 8,
    referralCount: 5,
  });
}
