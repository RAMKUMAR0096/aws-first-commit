import { NextRequest, NextResponse } from "next/server";
import {
  getAllApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
  resetInMemoryStoreToMock,
} from "@/lib/dynamodb";
import { JobApplication } from "@/lib/mock-data";

export async function GET() {
  try {
    const result = await getAllApplications();
    return NextResponse.json({
      success: true,
      data: result.data,
      isMock: result.isMock,
    });
  } catch (error: any) {
    console.error("GET applications error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "reset_mock") {
      const resetData = resetInMemoryStoreToMock();
      return NextResponse.json({
        success: true,
        data: resetData,
        isMock: true,
        message: "Reset applications to demo state.",
      });
    }

    const { companyName, roleTitle, location, salaryRange, status, jobUrl, notes, matchScore } = body as Partial<JobApplication>;

    if (!companyName || !roleTitle) {
      return NextResponse.json(
        { success: false, error: "Company name and role title are required." },
        { status: 400 }
      );
    }

    const result = await createApplication({
      companyName,
      roleTitle,
      location: location || "Remote",
      salaryRange: salaryRange || "Not Specified",
      appliedDate: new Date().toISOString().split("T")[0],
      status: status || "APPLIED",
      jobUrl: jobUrl || "",
      notes: notes || "",
      matchScore: matchScore || 75,
    });

    return NextResponse.json({
      success: true,
      data: result.application,
      isMock: result.isMock,
      message: result.isMock
        ? "Application saved (Demo Mode)."
        : "Application saved to AWS DynamoDB (CareerCopilotTracker).",
    });
  } catch (error: any) {
    console.error("POST application error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Application ID and new status are required." },
        { status: 400 }
      );
    }

    const result = await updateApplicationStatus(id, status);
    return NextResponse.json({
      success: true,
      isMock: result.isMock,
      message: `Updated status to ${status}.`,
    });
  } catch (error: any) {
    console.error("PUT application error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Application ID is required." }, { status: 400 });
    }

    const result = await deleteApplication(id);
    return NextResponse.json({
      success: true,
      isMock: result.isMock,
      message: "Application deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE application error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
