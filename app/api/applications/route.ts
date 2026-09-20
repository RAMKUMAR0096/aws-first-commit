import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getApplicationsByUserId,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
} from "@/lib/dynamodb";
import { JobApplication } from "@/lib/mock-data";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to access your application tracker." },
        { status: 401 }
      );
    }

    const result = await getApplicationsByUserId(userId);
    return NextResponse.json({
      success: true,
      data: result.data,
      isMock: result.isMock,
    });
  } catch (error: any) {
    console.error("GET applications error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch applications." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to log a new application." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const { companyName, roleTitle, location, salaryRange, status, jobUrl, notes, matchScore } = body as Partial<JobApplication>;

    if (!companyName || !roleTitle) {
      return NextResponse.json(
        { success: false, error: "Company name and role title are required." },
        { status: 400 }
      );
    }

    // Always associate with the authenticated Clerk user ID, ignoring client body.userId
    const result = await createApplication(
      {
        companyName,
        roleTitle,
        location: location || "Remote",
        salaryRange: salaryRange || "Not Specified",
        appliedDate: new Date().toISOString().split("T")[0],
        status: status || "APPLIED",
        jobUrl: jobUrl || "",
        notes: notes || "",
        matchScore: matchScore || 75,
      },
      userId
    );

    return NextResponse.json({
      success: true,
      data: result.application,
      isMock: result.isMock,
      message: result.isMock
        ? "Application saved to local session."
        : "Application persisted in AWS DynamoDB.",
    });
  } catch (error: any) {
    console.error("POST application error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create application." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to update applications." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Application ID and new status are required." },
        { status: 400 }
      );
    }

    const result = await updateApplicationStatus(id, status, userId);
    return NextResponse.json({
      success: true,
      isMock: result.isMock,
      message: `Updated status to ${status}.`,
    });
  } catch (error: any) {
    console.error("PUT application error:", error);
    const isForbidden = error.message?.includes("Forbidden");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update application status." },
      { status: isForbidden ? 403 : 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to delete applications." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Application ID is required." }, { status: 400 });
    }

    const result = await deleteApplication(id, userId);
    return NextResponse.json({
      success: true,
      isMock: result.isMock,
      message: "Application deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE application error:", error);
    const isForbidden = error.message?.includes("Forbidden");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete application." },
      { status: isForbidden ? 403 : 500 }
    );
  }
}
