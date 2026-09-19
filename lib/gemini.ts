import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, MOCK_ANALYSIS_RESULT } from "./mock-data";

export async function analyzeResumeWithGemini(
  resumeText: string,
  jobDescriptionText: string
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
    console.log("ℹ️ GEMINI_API_KEY missing or placeholder. Using high-fidelity fallback analysis.");
    return MOCK_ANALYSIS_RESULT;
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are a Lead Technical Recruiter and Engineering Director evaluating a candidate's resume against a specific Job Description.

OBJECTIVE: Perform an accurate, rigorous AI Career Gap Analysis by directly comparing the candidate's Resume text against the Job Description requirements.

CRITICAL SCORING & ANALYSIS RULES:
1. Identify ALL distinct technical skills, tools, frameworks, languages, and qualifications required in the JOB DESCRIPTION TEXT.
2. Categorize every skill into one of three strict groups:
   - MATCHED SKILLS: Skills explicitly stated in BOTH the Candidate Resume AND the Job Description.
   - PARTIAL SKILLS: Skills where the candidate has adjacent/foundational experience in the Resume, but lacks specific depth requested in the Job Description (specify the gap).
   - MISSING SKILLS: Skills required in the Job Description that are completely missing from the Candidate Resume (assign priority HIGH, MEDIUM, or LOW).
3. MATCH SCORE CALCULATION:
   Calculate matchScore (0 to 100) strictly using the formula:
   matchScore = Math.round(((Matched Skills Count + (Partial Skills Count * 0.5)) / Total Required Skills Count) * 100)
   Ensure matchScore is realistic, objective, and directly proportional to the matched vs missing skills list.
4. ZERO-HALLUCINATION RULE:
   Base all analysis strictly on the provided text. Do not invent or assume skills, projects, or employment history not present in the Resume text.
5. TAILORED INTERVIEW QUESTIONS:
   Generate 4 grounded technical and behavioral interview questions referencing specific projects, tools, or roles found in the Candidate Resume.

CANDIDATE RESUME TEXT:
"""
${resumeText}
"""

JOB DESCRIPTION TEXT:
"""
${jobDescriptionText}
"""
`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      matchScore: {
        type: Type.INTEGER,
        description: "Accurate calculated match percentage from 0 to 100 based on matched vs required skills.",
      },
      summary: {
        type: Type.STRING,
        description: "A detailed 2-3 sentence executive summary evaluating candidate alignment with the job description.",
      },
      matchedSkills: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of technical skills present in both Candidate Resume and Job Description.",
      },
      partialSkills: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            skill: { type: Type.STRING },
            gap: { type: Type.STRING, description: "Specific skill gap between candidate level and job requirement." },
          },
          required: ["skill", "gap"],
        },
      },
      missingSkills: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            skill: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
            category: { type: Type.STRING },
          },
          required: ["skill", "priority", "category"],
        },
      },
      learningRoadmap: {
        type: Type.OBJECT,
        properties: {
          day7: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                targetSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                estimatedHours: { type: Type.INTEGER },
                resourceType: { type: Type.STRING, enum: ["DOCUMENTATION", "PROJECT", "TUTORIAL"] },
              },
              required: ["id", "title", "description", "targetSkills", "estimatedHours", "resourceType"],
            },
          },
          day14: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                targetSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                estimatedHours: { type: Type.INTEGER },
                resourceType: { type: Type.STRING, enum: ["DOCUMENTATION", "PROJECT", "TUTORIAL"] },
              },
              required: ["id", "title", "description", "targetSkills", "estimatedHours", "resourceType"],
            },
          },
          day30: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                targetSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                estimatedHours: { type: Type.INTEGER },
                resourceType: { type: Type.STRING, enum: ["DOCUMENTATION", "PROJECT", "TUTORIAL"] },
              },
              required: ["id", "title", "description", "targetSkills", "estimatedHours", "resourceType"],
            },
          },
        },
        required: ["day7", "day14", "day30"],
      },
      interviewQuestions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["TECHNICAL", "BEHAVIORAL", "SYSTEM_DESIGN"] },
            question: { type: Type.STRING },
            contextFromResume: { type: Type.STRING, description: "Direct reference to a project, tool, or experience from candidate resume." },
            sampleAnswer: { type: Type.STRING, description: "Structured response template using STAR or technical format." },
            difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
            keyPointsToCover: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["id", "type", "question", "contextFromResume", "sampleAnswer", "difficulty", "keyPointsToCover"],
        },
      },
    },
    required: [
      "matchScore",
      "summary",
      "matchedSkills",
      "partialSkills",
      "missingSkills",
      "learningRoadmap",
      "interviewQuestions",
    ],
  };

  const CANDIDATE_MODELS = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest"];
  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`🤖 Requesting Gemini API with model '${modelName}' (attempt ${attempt})...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          },
        });

        if (response.text) {
          const parsedData = JSON.parse(response.text) as AnalysisResult;
          console.log(`✅ Gemini API analysis completed successfully with ${modelName}`);
          console.log(`📊 Calculated Match Score: ${parsedData.matchScore}% | Matched: ${parsedData.matchedSkills?.length || 0} | Missing: ${parsedData.missingSkills?.length || 0}`);
          return parsedData;
        }
      } catch (error: any) {
        lastError = error;
        const status = error?.status || error?.code || "";
        const msg = error?.message || String(error);
        console.warn(`⚠️ Model '${modelName}' attempt ${attempt} failed [Status ${status}]: ${msg}`);

        const isTransient = status === 503 || status === 429 || msg.includes("503") || msg.includes("high demand") || msg.includes("UNAVAILABLE");
        if (isTransient && attempt < 2) {
          console.log(`⏳ High demand / rate limit encountered. Waiting 1.5s before retry...`);
          await new Promise((res) => setTimeout(res, 1500));
        } else if (!isTransient) {
          break;
        }
      }
    }
  }

  console.error("❌ All Gemini API model attempts failed:", lastError);
  throw new Error(`Gemini AI Service Error: ${lastError?.message || "Failed to analyze resume with Gemini API."}`);
}
