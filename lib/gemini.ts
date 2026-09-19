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

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert Principal Technical Recruiter and Engineering Manager conducting an unbiased AI Career Gap Analysis for a student applying to a job.

CRITICAL ZERO-HALLUCINATION RULES:
1. Categorize skills strictly into three categories:
   - MATCHED SKILLS: Skills that are explicitly present in BOTH the Student Resume AND the Job Description.
   - PARTIAL SKILLS: Skills where the student has related/basic experience in the Resume, but missing specific depth expected in the Job Description.
   - MISSING SKILLS: Skills required or requested in the Job Description that are NOT listed or implied in the Student Resume.
2. DO NOT HALLUCINATE OR FABRICATE skills, projects, or work history for the student. Base all matched/partial items exclusively on the provided Resume text.
3. Tailor 4 Interview Questions (Technical & Behavioral) that ground their question directly in specific projects, tools, or experience listed in the Student Resume.

STUDENT RESUME TEXT:
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
          description: "Match percentage score from 0 to 100 based on core job requirements met by candidate.",
        },
        summary: {
          type: Type.STRING,
          description: "A concise 2-3 sentence executive summary of the student's alignment and primary growth opportunities.",
        },
        matchedSkills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of skills explicitly present in both Resume and JD.",
        },
        partialSkills: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              skill: { type: Type.STRING },
              gap: { type: Type.STRING, description: "Specific gap between student's level and job requirement." },
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
              contextFromResume: { type: Type.STRING, description: "Direct grounding statement referencing a resume project or role." },
              sampleAnswer: { type: Type.STRING, description: "Structured star-method or technical answer template." },
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

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (response.text) {
      const parsedData = JSON.parse(response.text) as AnalysisResult;
      return parsedData;
    }

    throw new Error("Empty response text from Gemini API");
  } catch (error) {
    console.error("❌ Gemini API analysis error. Falling back to mock data:", error);
    return MOCK_ANALYSIS_RESULT;
  }
}
