import { NextRequest, NextResponse } from "next/server";
import { analyzeResumeWithGemini } from "@/lib/gemini";
import { extractTextFromDocument } from "@/lib/pdf-parser";
import { MOCK_ANALYSIS_RESULT, MOCK_RESUME_TEXT, MOCK_JOB_DESCRIPTION } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let resumeText = "";
    let jobDescription = "";
    let isMockMode = false;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("resumeFile") as File | null;
      const textInput = formData.get("resumeText") as string | null;
      jobDescription = (formData.get("jobDescription") as string) || "";
      isMockMode = formData.get("useMock") === "true";

      if (isMockMode) {
        return NextResponse.json({
          success: true,
          data: MOCK_ANALYSIS_RESULT,
          isMock: true,
          message: "Loaded mock analysis data successfully.",
        });
      }

      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        resumeText = await extractTextFromDocument(buffer, file.type);
      } else if (textInput) {
        resumeText = textInput;
      }
    } else {
      const json = await req.json();
      resumeText = json.resumeText || "";
      jobDescription = json.jobDescription || "";
      isMockMode = json.useMock === true;

      if (isMockMode) {
        return NextResponse.json({
          success: true,
          data: MOCK_ANALYSIS_RESULT,
          isMock: true,
          message: "Loaded mock analysis data successfully.",
        });
      }
    }

    if (!resumeText || resumeText.trim().length < 10) {
      resumeText = MOCK_RESUME_TEXT;
    }
    if (!jobDescription || jobDescription.trim().length < 10) {
      jobDescription = MOCK_JOB_DESCRIPTION;
    }

    const analysis = await analyzeResumeWithGemini(resumeText, jobDescription);

    const hasApiKey = Boolean(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY.trim() !== "" &&
      process.env.GEMINI_API_KEY !== "your_gemini_api_key_here"
    );

    return NextResponse.json({
      success: true,
      data: analysis,
      isMock: !hasApiKey,
      message: hasApiKey ? "Gemini AI analysis completed successfully." : "Analyzed using local AI engine fallback.",
    });
  } catch (error: any) {
    console.error("Analysis route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to analyze resume and job description.",
        data: MOCK_ANALYSIS_RESULT,
        isMock: true,
      },
      { status: 500 }
    );
  }
}
