import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { userSubjects, subjects } from "@/db/schema/index";
import { sql } from "drizzle-orm";

// Hard-coded flag for LLM provider
const USE_OLLAMA = process.env.LLM_PROVIDER === "ollama";
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface GenerateTranscriptRequest {
  subject: string;
  studentLevel?: string;
}

/**
 * Generate a simulated tutor session transcript
 * POST /api/challenges/generate-transcript
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: GenerateTranscriptRequest = await req.json();
    const { subject, studentLevel = "intermediate" } = body;

    if (!subject) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    // Generate transcript using LLM
    const transcript = await generateTranscript(subject, studentLevel);
    
    // Generate summary from transcript
    const summary = await generateSummary(transcript, subject);

    // Increment tutoring sessions for this subject
    // Find the subject by name (case-insensitive match)
    const [subjectRecord] = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(sql`LOWER(${subjects.name}) = LOWER(${subject})`)
      .limit(1);

    if (subjectRecord) {
      // Find user's enrollment for this subject
      const [enrollment] = await db
        .select()
        .from(userSubjects)
        .where(
          sql`${userSubjects.userId} = ${session.user.id} AND ${userSubjects.subjectId} = ${subjectRecord.id}`
        )
        .limit(1);

      if (enrollment) {
        // Increment tutoring sessions
        await db
          .update(userSubjects)
          .set({
            tutoringSessions: sql`${userSubjects.tutoringSessions} + 1`,
          })
          .where(
            sql`${userSubjects.userId} = ${session.user.id} AND ${userSubjects.subjectId} = ${subjectRecord.id}`
          );
        console.log(
          `[generate-transcript] Incremented tutoring sessions for user ${session.user.id}, subject ${subject}`
        );
      } else {
        console.warn(
          `[generate-transcript] User ${session.user.id} not enrolled in subject ${subject}`
        );
      }
    } else {
      console.warn(`[generate-transcript] Subject ${subject} not found in database`);
    }

    return NextResponse.json({
      transcript,
      summary,
      subject,
      studentLevel,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[generate-transcript] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate transcript" },
      { status: 500 }
    );
  }
}

async function generateTranscript(
  subject: string,
  studentLevel: string
): Promise<string> {
  const prompt = `Generate a realistic 1-on-1 tutoring session transcript between a tutor and a ${studentLevel} level student studying ${subject}.

The session should:
- Be approximately 500-800 words
- Include the tutor explaining 2-3 key concepts
- Show the student asking clarifying questions
- Include some worked examples
- End with the tutor summarizing what was covered

Format as a natural conversation with "Tutor:" and "Student:" labels.`;

  if (USE_OLLAMA) {
    return await generateWithOllama(prompt);
  } else {
    return await generateWithOpenAI(prompt);
  }
}

async function generateSummary(
  transcript: string,
  subject: string
): Promise<string> {
  const prompt = `Given this tutoring session transcript for ${subject}, provide a concise summary (3-5 sentences) highlighting:
1. The main concepts covered
2. Key examples or problems discussed
3. Areas where the student showed understanding or confusion

Transcript:
${transcript}

Summary:`;

  if (USE_OLLAMA) {
    return await generateWithOllama(prompt);
  } else {
    return await generateWithOpenAI(prompt);
  }
}

async function generateWithOllama(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2", // or any model available in your Ollama setup
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("[Ollama] Generation error:", error);
    // Fallback to mock data if Ollama fails
    return generateMockData(prompt);
  }
}

async function generateWithOpenAI(prompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    console.warn("[OpenAI] API key not configured, using mock data");
    return generateMockData(prompt);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant generating educational content.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("[OpenAI] Generation error:", error);
    // Fallback to mock data if OpenAI fails
    return generateMockData(prompt);
  }
}

function generateMockData(prompt: string): string {
  // Determine if this is a transcript or summary request
  if (prompt.includes("tutoring session transcript")) {
    return `Tutor: Hi! Today we're going to work on quadratic equations. Let's start with the standard form: ax² + bx + c = 0. Do you remember what a, b, and c represent?

Student: I think a, b, and c are coefficients, right?

Tutor: Exactly! They're the numerical coefficients. Now, let's solve a simple example: x² + 5x + 6 = 0. We can factor this. What two numbers multiply to give us 6 and add to give us 5?

Student: Hmm... 2 and 3?

Tutor: Perfect! So we can write this as (x + 2)(x + 3) = 0. Now, for this product to equal zero, either (x + 2) = 0 or (x + 3) = 0. Can you solve for x in each case?

Student: So x = -2 or x = -3?

Tutor: Excellent! Those are our two solutions. Now let's try a slightly harder one: x² - 4x - 5 = 0.

Student: Okay, so I need two numbers that multiply to -5 and add to -4... Is it -5 and 1?

Tutor: Perfect! So (x - 5)(x + 1) = 0, which gives us x = 5 or x = -1. You're getting the hang of this!

Student: Thanks! What if the equation doesn't factor nicely?

Tutor: Great question! That's when we use the quadratic formula: x = [-b ± √(b² - 4ac)] / (2a). We'll cover that in our next session. For now, let's practice a couple more factoring problems to solidify your understanding.`;
  } else {
    // Summary
    return `This tutoring session covered the fundamentals of solving quadratic equations through factoring. The tutor introduced the standard form (ax² + bx + c = 0) and guided the student through factoring two examples: x² + 5x + 6 = 0 and x² - 4x - 5 = 0. The student demonstrated good understanding of the factoring process and successfully identified factor pairs. The session concluded with the student asking about non-factorable equations, prompting a brief introduction to the quadratic formula for future study.`;
  }
}

