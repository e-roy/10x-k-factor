"use server";

import { db } from "@/db/index";
import { users } from "@/db/auth-schema";
import { usersProfiles } from "@/db/user-schema";
import { results, tutorSessions, challenges } from "@/db/learning-schema";
import {
  cohorts,
  referrals,
  subjects,
  userSubjects,
  xpEvents,
  events,
} from "@/db/schema/index";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";
import { z } from "zod";
import { eq, inArray, sql, and } from "drizzle-orm";
import type {
  Persona,
  ChallengeQuestion,
  Difficulty,
  ChallengeStatus,
} from "@/db/types";

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
  createCohorts: z.boolean().default(false),
  createSubjectEnrollments: z.boolean().default(false),
  createXpEvents: z.boolean().default(false),
  createReferrals: z.boolean().default(false),
  createEvents: z.boolean().default(false),
  createTutoringSessions: z.boolean().default(false),
  createChallenges: z.boolean().default(false),
  // Numeric options
  cohortsPerSubject: z.number().int().min(1).max(10).default(2),
  xpEventsPerUser: z.number().int().min(1).max(50).default(5),
  referralCount: z.number().int().min(1).max(20).default(3),
  eventsPerDay: z.number().int().min(1).max(50).default(10),
  tutoringSessionsPerUser: z.number().int().min(1).max(20).default(3),
  challengesPerUser: z.number().int().min(1).max(20).default(5),
});

export interface SeedResult {
  success: boolean;
  usersCreated: number;
  resultsCreated: number;
  parentsCreated?: number;
  cohortsCreated?: number;
  enrollmentsCreated?: number;
  xpEventsCreated?: number;
  referralsCreated?: number;
  eventsCreated?: number;
  tutoringSessionsCreated?: number;
  challengesCreated?: number;
  existingUsersUsed?: number;
  error?: string;
}

/**
 * Seed events for K-factor metrics
 * Creates invite.sent, invite.joined, and invite.fvm events across multiple loops and days
 */
async function seedEventsForKFactor(
  studentUserIds: string[],
  fromDate: Date,
  toDate: Date,
  eventsPerDay: number
): Promise<number> {
  if (studentUserIds.length < 2) return 0;

  const loops = [
    "buddy_challenge",
    "tutor_spotlight",
    "results_share",
    "results_rally",
    "proud_parent",
    "streak_rescue",
  ];

  const eventsToCreate = [];

  // Calculate days in range
  const daysDiff = Math.ceil(
    (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const days = Math.max(1, daysDiff);

  // Create events for each day
  for (let day = 0; day < days; day++) {
    const eventDate = new Date(fromDate);
    eventDate.setDate(eventDate.getDate() + day);

    // Create events for this day
    for (let i = 0; i < eventsPerDay; i++) {
      const loop = loops[Math.floor(Math.random() * loops.length)];
      const inviterId =
        studentUserIds[Math.floor(Math.random() * studentUserIds.length)];
      const smartLinkCode = randomUUID().slice(0, 12);

      // Create invite.sent event
      const sentTime = new Date(eventDate);
      sentTime.setHours(
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60)
      );

      eventsToCreate.push({
        ts: sentTime,
        userId: inviterId,
        anonId: null,
        loop,
        name: "invite.sent",
        props: {
          inviter_id: inviterId,
          loop,
          smart_link_code: smartLinkCode,
          seeded: true,
        },
      });

      // 70% of invites get opened/joined
      if (Math.random() < 0.7) {
        const joinedTime = new Date(
          sentTime.getTime() + Math.random() * 2 * 60 * 60 * 1000
        ); // Within 2 hours

        eventsToCreate.push({
          ts: joinedTime,
          userId: null, // Invitee might not be a user yet
          anonId: randomUUID(),
          loop,
          name: "invite.joined",
          props: {
            smart_link_code: smartLinkCode,
            loop,
            inviter_id: inviterId,
            seeded: true,
          },
        });

        // 60% of joins reach FVM
        if (Math.random() < 0.6) {
          const fvmTime = new Date(
            joinedTime.getTime() + Math.random() * 24 * 60 * 60 * 1000
          ); // Within 24 hours
          const inviteeId =
            studentUserIds[Math.floor(Math.random() * studentUserIds.length)];

          eventsToCreate.push({
            ts: fvmTime,
            userId: inviteeId,
            anonId: null,
            loop,
            name: "invite.fvm",
            props: {
              smart_link_code: smartLinkCode,
              loop,
              inviter_id: inviterId,
              invitee_id: inviteeId,
              deck_id: randomUUID(),
              completion_time_ms: fvmTime.getTime() - sentTime.getTime(),
              seeded: true,
            },
          });
        }
      }
    }
  }

  if (eventsToCreate.length > 0) {
    await db.insert(events).values(eventsToCreate);
  }

  return eventsToCreate.length;
}

/**
 * Seed tutoring sessions for students
 * Creates realistic tutor session records with transcripts, summaries, and durations
 */
async function seedTutoringSessions(
  studentUserIds: string[],
  subjectList: string[],
  sessionsPerUser: number,
  fromDate: Date,
  toDate: Date
): Promise<number> {
  if (studentUserIds.length === 0 || subjectList.length === 0) return 0;

  const sessionsToCreate = [];
  const timestamp = Date.now();

  // Sample transcript templates by subject
  const transcriptTemplates: Record<string, string[]> = {
    algebra: [
      "Student asked about quadratic equations. We worked through factoring method and completing the square. Student showed good understanding of the quadratic formula.",
      "Focused on solving linear equations with multiple variables. Student practiced substitution and elimination methods. Discussed real-world applications.",
      "Covered polynomial operations including addition, subtraction, and multiplication. Student completed several practice problems successfully.",
    ],
    geometry: [
      "Explored properties of triangles and the Pythagorean theorem. Student worked through problems involving right triangles and special right triangles.",
      "Discussed area and perimeter calculations for various shapes. Student practiced finding areas of circles, rectangles, and composite figures.",
      "Covered angle relationships including complementary, supplementary, and vertical angles. Student demonstrated strong geometric reasoning.",
    ],
    calculus: [
      "Introduced limits and continuity concepts. Student worked through limit problems using algebraic manipulation and graphical analysis.",
      "Focused on derivatives and their applications. Covered power rule, product rule, and chain rule. Student practiced finding derivatives of various functions.",
      "Explored integration techniques including u-substitution. Student worked through definite and indefinite integrals with good progress.",
    ],
    physics: [
      "Discussed Newton's laws of motion and force diagrams. Student practiced drawing free-body diagrams and solving force problems.",
      "Covered kinematics including position, velocity, and acceleration. Student worked through problems involving constant acceleration.",
      "Explored energy conservation and work-energy theorem. Student demonstrated understanding of potential and kinetic energy concepts.",
    ],
    chemistry: [
      "Focused on chemical bonding including ionic and covalent bonds. Student practiced drawing Lewis structures and predicting molecular geometry.",
      "Discussed stoichiometry and mole calculations. Student worked through problems involving mass-to-mole conversions and limiting reactants.",
      "Covered acid-base chemistry and pH calculations. Student practiced identifying acids, bases, and calculating pH values.",
    ],
  };

  const summaryTemplates: Record<string, string[]> = {
    algebra: [
      "Focused on solving quadratic equations using factoring method",
      "Practiced linear equation systems with substitution",
      "Reviewed polynomial operations and simplification",
    ],
    geometry: [
      "Explored triangle properties and Pythagorean theorem applications",
      "Practiced area and perimeter calculations for various shapes",
      "Covered angle relationships and geometric reasoning",
    ],
    calculus: [
      "Introduced limits and continuity with algebraic techniques",
      "Focused on derivative rules and their applications",
      "Explored integration techniques including u-substitution",
    ],
    physics: [
      "Discussed Newton's laws and force diagram analysis",
      "Covered kinematics and motion equations",
      "Explored energy conservation principles",
    ],
    chemistry: [
      "Focused on chemical bonding and molecular structure",
      "Practiced stoichiometry and mole calculations",
      "Covered acid-base chemistry and pH concepts",
    ],
  };

  for (const studentId of studentUserIds) {
    for (let i = 0; i < sessionsPerUser; i++) {
      const subject =
        subjectList[Math.floor(Math.random() * subjectList.length)];
      const subjectKey = subject.toLowerCase();

      // Get templates for this subject or use generic ones
      const transcripts = transcriptTemplates[subjectKey] || [
        `Student asked about ${subject} concepts. We worked through several practice problems and discussed key principles.`,
      ];
      const summaries = summaryTemplates[subjectKey] || [
        `Focused on ${subject} fundamentals and problem-solving techniques`,
      ];

      const transcript =
        transcripts[Math.floor(Math.random() * transcripts.length)];
      const summary = summaries[Math.floor(Math.random() * summaries.length)];
      const duration = Math.floor(Math.random() * 46) + 15; // 15-60 minutes
      const tutorId = Math.random() < 0.3 ? null : randomUUID(); // 30% chance of null (simulated)

      // Random date within range
      const timeRange = toDate.getTime() - fromDate.getTime();
      const randomTime = fromDate.getTime() + Math.random() * timeRange;
      const createdAt = new Date(randomTime);

      sessionsToCreate.push({
        id: randomUUID(),
        studentId,
        tutorId,
        subject,
        transcript,
        summary,
        tutorNotes: null,
        studentNotes: null,
        duration,
        metadata: {
          seeded: true,
          seedTimestamp: timestamp,
        },
        createdAt,
      });
    }
  }

  if (sessionsToCreate.length > 0) {
    await db.insert(tutorSessions).values(sessionsToCreate);
  }

  return sessionsToCreate.length;
}

/**
 * Seed challenges for students
 * Creates realistic challenge records with questions, difficulty levels, and statuses
 */
async function seedChallenges(
  studentUserIds: string[],
  subjectList: string[],
  challengesPerUser: number,
  fromDate: Date,
  toDate: Date,
  sessionIds?: string[]
): Promise<number> {
  if (studentUserIds.length === 0 || subjectList.length === 0) return 0;

  const challengesToCreate = [];
  const timestamp = Date.now();

  // Sample question templates by subject and difficulty
  const questionTemplates: Record<
    string,
    Record<
      string,
      Array<{
        question: string;
        options: string[];
        correct: number;
        explanation?: string;
      }>
    >
  > = {
    algebra: {
      easy: [
        {
          question: "What is the value of x if 2x + 3 = 7?",
          options: ["x = 1", "x = 2", "x = 3", "x = 4"],
          correct: 1,
          explanation:
            "Subtract 3 from both sides: 2x = 4, then divide by 2: x = 2",
        },
        {
          question: "Simplify: 3x + 5x",
          options: ["8x", "15x", "8x²", "15x²"],
          correct: 0,
          explanation: "Combine like terms: 3x + 5x = 8x",
        },
      ],
      medium: [
        {
          question: "Solve for x: 3x - 7 = 2x + 5",
          options: ["x = 12", "x = 2", "x = -12", "x = -2"],
          correct: 0,
          explanation:
            "Subtract 2x from both sides: x - 7 = 5, then add 7: x = 12",
        },
        {
          question: "Factor: x² - 9",
          options: ["(x-3)(x+3)", "(x-9)(x+1)", "(x-3)²", "Cannot be factored"],
          correct: 0,
          explanation: "This is a difference of squares: x² - 9 = (x-3)(x+3)",
        },
      ],
      hard: [
        {
          question: "Solve the quadratic equation: x² - 5x + 6 = 0",
          options: [
            "x = 2 or x = 3",
            "x = -2 or x = -3",
            "x = 1 or x = 6",
            "x = 0 or x = 5",
          ],
          correct: 0,
          explanation: "Factor: (x-2)(x-3) = 0, so x = 2 or x = 3",
        },
      ],
    },
    geometry: {
      easy: [
        {
          question:
            "What is the area of a rectangle with length 5 and width 3?",
          options: ["8", "15", "16", "30"],
          correct: 1,
          explanation: "Area = length × width = 5 × 3 = 15",
        },
      ],
      medium: [
        {
          question:
            "In a right triangle, if one leg is 3 and the other is 4, what is the hypotenuse?",
          options: ["5", "7", "12", "25"],
          correct: 0,
          explanation:
            "Using Pythagorean theorem: 3² + 4² = 9 + 16 = 25, so hypotenuse = √25 = 5",
        },
      ],
      hard: [
        {
          question: "What is the area of a circle with radius 6?",
          options: ["12π", "18π", "36π", "72π"],
          correct: 2,
          explanation: "Area = πr² = π(6)² = 36π",
        },
      ],
    },
  };

  const difficulties: Difficulty[] = ["easy", "medium", "hard"];
  const statuses: ChallengeStatus[] = [
    "pending",
    "active",
    "completed",
    "expired",
  ];
  const loops = [
    "buddy_challenge",
    "tutor_spotlight",
    "results_share",
    "results_rally",
  ];

  for (const studentId of studentUserIds) {
    for (let i = 0; i < challengesPerUser; i++) {
      const subject =
        subjectList[Math.floor(Math.random() * subjectList.length)];
      const subjectKey = subject.toLowerCase();
      const difficulty =
        difficulties[Math.floor(Math.random() * difficulties.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Generate 3-5 questions
      const questionCount = Math.floor(Math.random() * 3) + 3; // 3-5 questions
      const questions: ChallengeQuestion[] = [];

      // Get question templates for this subject and difficulty, or use generic ones
      const templates = questionTemplates[subjectKey]?.[difficulty] || [
        {
          question: `Sample ${subject} question ${i + 1}`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correct: Math.floor(Math.random() * 4),
        },
      ];

      for (let j = 0; j < questionCount; j++) {
        const template = templates[j % templates.length];
        questions.push({
          question: template.question,
          options: [...template.options],
          correctAnswer: template.correct,
          explanation: template.explanation,
        });
      }

      // Random date within range
      const timeRange = toDate.getTime() - fromDate.getTime();
      const randomTime = fromDate.getTime() + Math.random() * timeRange;
      const createdAt = new Date(randomTime);

      // Optional session linking
      const sessionId =
        sessionIds && sessionIds.length > 0 && Math.random() < 0.4
          ? sessionIds[Math.floor(Math.random() * sessionIds.length)]
          : null;

      // Optional loop
      const loop =
        Math.random() < 0.5
          ? loops[Math.floor(Math.random() * loops.length)]
          : null;

      // For completed challenges: add score and completedAt
      const score =
        status === "completed" ? Math.floor(Math.random() * 41) + 60 : null; // 60-100
      const completedAt =
        status === "completed"
          ? new Date(
              createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000
            )
          : null; // Within 7 days of creation

      // For pending/active challenges: add expiresAt
      const expiresAt =
        status === "pending" || status === "active"
          ? new Date(
              createdAt.getTime() +
                (7 + Math.random() * 14) * 24 * 60 * 60 * 1000
            )
          : null; // 7-21 days from creation

      challengesToCreate.push({
        id: randomUUID(),
        sessionId,
        userId: studentId,
        invitedUserId: null,
        subject,
        questions,
        difficulty,
        status,
        score,
        completedAt,
        expiresAt,
        loop,
        metadata: {
          seeded: true,
          seedTimestamp: timestamp,
        },
        createdAt,
      });
    }
  }

  if (challengesToCreate.length > 0) {
    await db.insert(challenges).values(challengesToCreate);
  }

  return challengesToCreate.length;
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
        cohortsCreated: 0,
        enrollmentsCreated: 0,
        xpEventsCreated: 0,
        referralsCreated: 0,
        eventsCreated: 0,
        tutoringSessionsCreated: 0,
        challengesCreated: 0,
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
        cohortsCreated: 0,
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
          cohortsCreated: 0,
          enrollmentsCreated: 0,
          xpEventsCreated: 0,
          referralsCreated: 0,
          error:
            "Selected users not found or are not students. Please select valid users.",
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
          firstName =
            FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
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
    let cohortsCreated = 0;
    let enrollmentsCreated = 0;
    let xpEventsCreated = 0;
    let referralsCreated = 0;
    let eventsCreated = 0;
    let tutoringSessionsCreated = 0;
    let challengesCreated = 0;

    // Validate we have users to work with for advanced options
    if (
      studentUserIds.length === 0 &&
      (validated.createParents ||
        validated.createCohorts ||
        validated.createSubjectEnrollments ||
        validated.createXpEvents ||
        validated.createReferrals ||
        validated.createEvents ||
        validated.createTutoringSessions ||
        validated.createChallenges)
    ) {
      return {
        success: false,
        usersCreated: usersToCreate.length,
        resultsCreated: resultsToCreate.length,
        parentsCreated: 0,
        cohortsCreated: 0,
        enrollmentsCreated: 0,
        xpEventsCreated: 0,
        referralsCreated: 0,
        error:
          "No users available for advanced options. Please create users or select existing users.",
      };
    }

    // Validate user count requirements for specific options
    if (validated.createEvents && studentUserIds.length < 2) {
      return {
        success: false,
        usersCreated: usersToCreate.length,
        resultsCreated: resultsToCreate.length,
        parentsCreated: 0,
        cohortsCreated: 0,
        enrollmentsCreated: 0,
        xpEventsCreated: 0,
        referralsCreated: 0,
        eventsCreated: 0,
        tutoringSessionsCreated: 0,
        challengesCreated: 0,
        error: `Cannot create events: requires at least 2 users. You selected ${studentUserIds.length} user(s).`,
      };
    }

    if (validated.createReferrals && studentUserIds.length < 2) {
      return {
        success: false,
        usersCreated: usersToCreate.length,
        resultsCreated: resultsToCreate.length,
        parentsCreated: 0,
        cohortsCreated: 0,
        enrollmentsCreated: 0,
        xpEventsCreated: 0,
        referralsCreated: 0,
        eventsCreated: 0,
        tutoringSessionsCreated: 0,
        challengesCreated: 0,
        error: `Cannot create referrals: requires at least 2 users. You selected ${studentUserIds.length} user(s).`,
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
          firstName =
            FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
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

          for (
            let j = 0;
            j < studentsForParent && studentIndex < shuffledStudents.length;
            j++
          ) {
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

    // 2. Create cohorts
    if (validated.createCohorts && studentUserIds.length > 0) {
      const cohortsToCreate = [];
      const cohortNames = [
        "Study Group",
        "Warriors",
        "Champions",
        "Elite Team",
        "Masters",
        "Aces",
        "Stars",
        "Leaders",
      ];

      for (const subject of subjectList) {
        for (let i = 0; i < validated.cohortsPerSubject; i++) {
          const cohortId = randomUUID();
          const cohortName =
            cohortNames[Math.floor(Math.random() * cohortNames.length)];
          const creatorId =
            studentUserIds[Math.floor(Math.random() * studentUserIds.length)];

          cohortsToCreate.push({
            id: cohortId,
            name: `${subject.charAt(0).toUpperCase() + subject.slice(1)} ${cohortName}`,
            subject,
            createdBy: creatorId,
            createdAt: new Date(),
          });
        }
      }

      if (cohortsToCreate.length > 0) {
        await db.insert(cohorts).values(cohortsToCreate);
        cohortsCreated = cohortsToCreate.length;
      }
    }

    // 3. Create subject enrollments
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
            name: subjectSlug.charAt(0).toUpperCase() + subjectSlug.slice(1),
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

      const subjectIdMap = new Map(allSubjects.map((s) => [s.slug, s.id]));

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
        "cohort.leaderboard_top3",
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

      while (
        created < maxReferrals &&
        usedPairs.size <
          (studentUserIds.length * (studentUserIds.length - 1)) / 2
      ) {
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
            inviteeScore: completed
              ? Math.floor(Math.random() * 41) + 60
              : undefined,
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

    // 6. Create tutoring sessions
    if (validated.createTutoringSessions && studentUserIds.length > 0) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const fromDate = thirtyDaysAgo;
      const toDate = today;

      tutoringSessionsCreated = await seedTutoringSessions(
        studentUserIds,
        subjectList,
        validated.tutoringSessionsPerUser,
        fromDate,
        toDate
      );
    }

    // 7. Create challenges
    if (validated.createChallenges && studentUserIds.length > 0) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const fromDate = thirtyDaysAgo;
      const toDate = today;

      // Optionally link challenges to tutor sessions if both were created
      let sessionIds: string[] | undefined;
      if (validated.createTutoringSessions && tutoringSessionsCreated > 0) {
        // Fetch session IDs that were just created
        const recentSessions = await db.execute(sql`
          SELECT id FROM tutor_sessions
          WHERE metadata->>'seeded' = 'true'
          ORDER BY created_at DESC
          LIMIT ${tutoringSessionsCreated}
        `);
        sessionIds = (recentSessions as unknown as Array<{ id: string }>).map(
          (s) => s.id
        );
      }

      challengesCreated = await seedChallenges(
        studentUserIds,
        subjectList,
        validated.challengesPerUser,
        fromDate,
        toDate,
        sessionIds
      );
    }

    // 8. Create events for K-factor metrics
    if (validated.createEvents && studentUserIds.length >= 2) {
      // Default to last 30 days if no date range provided
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const fromDate = thirtyDaysAgo;
      const toDate = today;

      eventsCreated = await seedEventsForKFactor(
        studentUserIds,
        fromDate,
        toDate,
        validated.eventsPerDay
      );

      // Refresh materialized view after seeding events
      if (eventsCreated > 0) {
        try {
          await db.execute(
            sql`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_loop_daily;`
          );
        } catch (error) {
          console.warn("[seed] Failed to refresh materialized view:", error);
          // Don't fail the whole operation if MV refresh fails
        }
      }
    }

    return {
      success: true,
      usersCreated: usersToCreate.length,
      resultsCreated: resultsToCreate.length,
      parentsCreated,
      cohortsCreated,
      enrollmentsCreated,
      xpEventsCreated,
      referralsCreated,
      eventsCreated,
      tutoringSessionsCreated,
      challengesCreated,
      existingUsersUsed:
        validated.selectedUserIds && validated.selectedUserIds.length > 0
          ? studentUserIds.length
          : undefined,
    };
  } catch (error) {
    console.error("[seed] Error seeding data:", error);
    return {
      success: false,
      usersCreated: 0,
      resultsCreated: 0,
      parentsCreated: 0,
      cohortsCreated: 0,
      enrollmentsCreated: 0,
      xpEventsCreated: 0,
      referralsCreated: 0,
      eventsCreated: 0,
      tutoringSessionsCreated: 0,
      challengesCreated: 0,
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
    createCohorts: true,
    createSubjectEnrollments: true,
    createXpEvents: true,
    createReferrals: true,
    createEvents: true,
    createTutoringSessions: true,
    createChallenges: true,
    cohortsPerSubject: 2,
    xpEventsPerUser: 8,
    referralCount: 5,
    eventsPerDay: 10,
    tutoringSessionsPerUser: 3,
    challengesPerUser: 5,
  });
}
