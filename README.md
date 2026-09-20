# AI Career Copilot for Students 🚀
> **Bharat Builds Hackathon 2026 Submission** | Next.js 16, Clerk Auth, Google Gemini 1.5 Flash & AWS DynamoDB

**AI Career Copilot for Students** is a production-ready, zero-hallucination web application designed to help final-year computer science and engineering students audit their skill gaps against real-world job descriptions, get a 7/14/30-day actionable study roadmap, practice resume-grounded interview questions, and track job applications in live AWS DynamoDB with strict per-user authentication.

---

## 🌟 Key Features

### 1. User Authentication & Multi-Tenant Data Isolation (Clerk)
- **Secure Authentication**: Built with `@clerk/nextjs` Core 3 (`<Show>` conditional control, modal sign-in & sign-up).
- **Per-User Workspace**: Job applications stored in AWS DynamoDB are automatically tied to the authenticated user's `userId`, ensuring complete data privacy and isolation.

### 2. Zero-Hallucination Resume & JD Analyzer (`/api/analyze`)
- **Drag-and-Drop Parser**: Accepts PDF and plain text resume files.
- **Dynamic Submit Validation**: Submit button requires both Resume (file or text) and Job Description before enabling.
- **Strict Skill Matrix**: Categorizes candidate fit into **MATCHED**, **PARTIAL** (with specific gap callouts), and **MISSING** skills.
- **Gemini 1.5 Flash Engine**: Powered by `@google/genai` with strict JSON schema validation for high-speed, zero-cost career gap analysis.

### 3. "What Should I Learn?" Actionable Roadmap
- **7-Day, 14-Day, and 30-Day Milestones**: Actionable learning timeline generated exclusively from identified missing skills.
- **Interactive Checklist**: Track task completion with live progress ring updates.

### 4. Contextual Interview Preparation
- **Resume-Grounded Questions**: Tailors technical and behavioral interview questions directly anchored in the candidate's actual projects and experience.
- **STAR Answer Guides**: Detailed sample answers with key points to cover and difficulty ratings.

### 5. AWS DynamoDB Application Tracker (`/api/applications`)
- **Live AWS Cloud Persistence**: Automatically creates and maps directly to the AWS DynamoDB table `CareerCopilotTracker` in region `us-east-1`.
- **Auto-Provisioning**: Features automated table detection (`ensureTableExists()`) on AWS with `PAY_PER_REQUEST` billing mode.
- **CLI Table Inspector**: Includes `npm run db:view` command to inspect live DynamoDB items directly in your CLI terminal.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack), TypeScript, React 19
- **Authentication**: `@clerk/nextjs` (Clerk Core 3)
- **Styling & Animation**: Tailwind CSS v4, Glassmorphism design system, Framer Motion staggered transitions, Lucide React Icons, Canvas Confetti
- **UI Feedback & Charts**: Sonner toast notifications, Recharts radial match score gauge
- **Cloud Infrastructure (AWS)**: AWS DynamoDB (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`)
- **AI Engine**: `@google/genai` (Google Gemini 1.5 Flash)

---

## ⚡ Quick Start (Local Setup)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/aws-first-commit.git
cd aws-first-commit
npm install
```

### 2. Configure Environment Variables
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Configure your environment variables in `.env.local`:
```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# AWS Credentials & DynamoDB Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
DYNAMODB_TABLE_NAME=CareerCopilotTracker

# Clerk Auth Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

> **Automatic Clerk & AWS Setup**:
> - Running `npx clerk@latest init` automatically configures development Clerk keys.
> - The application automatically provisions the `CareerCopilotTracker` table on AWS DynamoDB if it doesn't exist.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔍 Inspect Live AWS DynamoDB Data via CLI

You can inspect all job applications stored in your live AWS DynamoDB table at any time directly from your terminal:

```bash
npm run db:view
```

---

## 🛡️ AWS DynamoDB Table Specification

When connecting your live AWS account:
- **Table Name**: `CareerCopilotTracker` (or customized via `DYNAMODB_TABLE_NAME`)
- **Region**: `us-east-1` (or customized via `AWS_REGION`)
- **Partition Key (HASH)**: `id` (String)
- **Billing Mode**: On-Demand (`PAY_PER_REQUEST`)
- **Security**: Server-side filtering by `userId` guarantees user isolation.

---

## ☁️ Deployment

1. Push this repository to GitHub.
2. Log in to the [AWS Amplify Console](https://console.aws.amazon.com/amplify/) or Vercel.
3. Import your repository and configure your environment variables (`GEMINI_API_KEY`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).
4. Click **Deploy**. Next.js App Router will build and deploy automatically!
