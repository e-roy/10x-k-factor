import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { db } from "@/db/index";
import { results, usersProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resultId = searchParams.get("resultId");
    const tutorId = searchParams.get("tutorId");
    const type = searchParams.get("type"); // "tutor" or "result" (default)
    const persona = searchParams.get("persona") || "student";

    // Handle tutor OG card
    if (type === "tutor" && tutorId) {
      // Fetch tutor profile data (no PII - just persona)
      const [tutorProfile] = await db
        .select({
          persona: usersProfiles.persona,
        })
        .from(usersProfiles)
        .where(eq(usersProfiles.userId, tutorId))
        .limit(1);

      if (!tutorProfile || tutorProfile.persona !== "tutor") {
        return new Response("Tutor not found", { status: 404 });
      }

      // Get subject from query params or use default
      const subject = searchParams.get("subject") || "learning";

      return new ImageResponse(
        (
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#ffffff",
              backgroundImage:
                "linear-gradient(to bottom right, #6366f1 0%, #8b5cf6 100%)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                padding: "40px 60px",
              }}
            >
              {/* App Title */}
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#ffffff",
                  marginBottom: 20,
                  opacity: 0.9,
                }}
              >
                10x K Factor
              </div>

              {/* Main Title */}
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 800,
                  color: "#ffffff",
                  textAlign: "center",
                  marginBottom: 16,
                  lineHeight: 1.2,
                }}
              >
                Tutor Spotlight
              </div>

              {/* Subtitle */}
              <div
                style={{
                  fontSize: 28,
                  color: "#e0e7ff",
                  textAlign: "center",
                  marginBottom: 40,
                }}
              >
                New {subject} challenge ready! Join my students and level up 🚀
              </div>

              {/* Tutor Badge/Icon */}
              <div
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 80,
                  fontWeight: 800,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                  marginTop: 20,
                }}
              >
                🎓
              </div>

              {/* Footer */}
              <div
                style={{
                  position: "absolute",
                  bottom: 40,
                  fontSize: 18,
                  color: "#c7d2fe",
                }}
              >
                Click to join the challenge and unlock rewards
              </div>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Handle result OG card (existing logic)
    if (!resultId) {
      return new Response("Missing resultId or tutorId", { status: 400 });
    }

    // Fetch result data
    const [result] = await db
      .select({
        score: results.score,
        subject: results.subject,
      })
      .from(results)
      .where(eq(results.id, resultId))
      .limit(1);

    if (!result) {
      return new Response("Result not found", { status: 404 });
    }

    const score = result.score ?? 0;
    const subject = result.subject || "Test";

    // Persona-specific messaging
    const messages = {
      student: {
        title: `I scored ${score}% in ${subject}!`,
        subtitle: "Challenge yourself and see how you compare!",
      },
      parent: {
        title: `Progress in ${subject}`,
        subtitle: `Score: ${score}% - See detailed results and next steps`,
      },
      tutor: {
        title: `${subject} Results Dashboard`,
        subtitle: `Performance metrics and recommendations`,
      },
    };

    const message =
      messages[persona as keyof typeof messages] || messages.student;

    // Color scheme based on score
    const getScoreColor = (score: number) => {
      if (score >= 80) return "#10b981"; // green
      if (score >= 60) return "#f59e0b"; // yellow
      return "#ef4444"; // red
    };

    const scoreColor = getScoreColor(score);

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            backgroundImage:
              "linear-gradient(to bottom right, #f8fafc 0%, #e2e8f0 100%)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              padding: "40px 60px",
            }}
          >
            {/* App Title */}
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: 20,
              }}
            >
              10x K Factor
            </div>

            {/* Main Title */}
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: "#0f172a",
                textAlign: "center",
                marginBottom: 16,
                lineHeight: 1.2,
              }}
            >
              {message.title}
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: 24,
                color: "#64748b",
                textAlign: "center",
                marginBottom: 40,
              }}
            >
              {message.subtitle}
            </div>

            {/* Score Display */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 24,
                marginTop: 20,
              }}
            >
              {/* Large Score Circle */}
              <div
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  backgroundColor: scoreColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: 72,
                  fontWeight: 800,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
              >
                {score}%
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                position: "absolute",
                bottom: 40,
                fontSize: 18,
                color: "#94a3b8",
              }}
            >
              Click to view full results and take the challenge
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
