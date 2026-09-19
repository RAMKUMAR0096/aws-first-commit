import "@/lib/polyfill";
import { NextRequest, NextResponse } from "next/server";
import { analyzeResumeWithGemini } from "@/lib/gemini";
import { extractTextFromDocument } from "@/lib/pdf-parser";
import { MOCK_ANALYSIS_RESULT } from "@/lib/mock-data";

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
      return NextResponse.json(
        {
          success: false,
          error: "No valid resume text found. Please upload a clear PDF resume or type your resume details.",
        },
        { status: 400 }
      );
    }

    if (!jobDescription || jobDescription.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Job Description is required. Please paste a valid job description to compare against.",
        },
        { status: 400 }
      );
    }

    const analysis = await analyzeResumeWithGemini(resumeText, jobDescription);

    return NextResponse.json({
      success: true,
      data: analysis,
      isMock: false,
      message: "Gemini AI analysis completed successfully.",
    });
  } catch (error: any) {
    console.error("❌ Analysis API route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to analyze resume with Gemini AI.",
      },
      { status: 500 }
    );
  }
}
