# AI Career Copilot for Students 🚀
> **Bharat Builds Hackathon 2026 Submission** | Next.js 15, Google Gemini 1.5 Flash & AWS Amplify Ready

**AI Career Copilot for Students** is a production-ready, zero-hallucination web application designed to help final-year computer science and engineering students audit their skill gaps against real-world job descriptions, get a 7/14/30-day actionable study roadmap, practice resume-grounded interview questions, and track job applications in AWS DynamoDB.

---

## 🌟 Key Features

### 1. Zero-Hallucination Resume & JD Analyzer (`/api/analyze`)
- **Drag-and-Drop Parser**: Accepts PDF and plain text resume files.
- **Strict Skill Matrix**: Categorizes candidate fit strictly into **MATCHED**, **PARTIAL** (with specific gap callouts), and **MISSING** skills.
- **Gemini 1.5 Flash Engine**: Leverages `@google/genai` with strict JSON schema response validation for high-speed, zero-cost analysis.

### 2. "What Should I Learn?" Actionable Roadmap
- **7-Day, 14-Day, and 30-Day Milestones**: Actionable learning timeline generated exclusively from identified missing skills.
- **Interactive Checklist**: Track task completion with live progress ring updates.

### 3. Contextual Interview Preparation
- **Resume-Grounded Questions**: Tailors technical and behavioral interview questions directly anchored in the candidate's actual projects and experience.
- **STAR Answer Guides**: Detailed sample answers with key points to cover and difficulty ratings.

### 4. AWS DynamoDB Application Tracker (`/api/applications`)
- **Real-Time Data Table**: Log and manage job submissions (`APPLIED`, `INTERVIEW`, `OFFER`, `REJECTED`).
- **AWS DynamoDB Integration**: Maps directly to DynamoDB table `CareerCopilotTracker`.
- **Seamless Offline Fallback**: If AWS or Gemini API keys are unconfigured, automatically falls back to an in-memory mock engine so judges can test all features live with zero setup.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router), TypeScript, React 19
- **Styling & Animation**: Tailwind CSS v4, Glassmorphism design system, Framer Motion staggered transitions, Lucide React Icons, Canvas Confetti
- **UI Feedback & Charts**: Sonner toast notifications, Recharts radial match score gauge
- **Cloud Infrastructure (AWS)**: `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `@aws-sdk/client-s3`
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

Fill in your API keys (optional — app runs in **Demo Mode** if unconfigured):
```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# AWS Credentials & DynamoDB Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
DYNAMODB_TABLE_NAME=CareerCopilotTracker
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deploying to AWS Amplify

1. Push this repository to GitHub.
2. Log in to the [AWS Amplify Console](https://console.aws.amazon.com/amplify/).
3. Click **Host web app** and connect your GitHub repository.
4. Under **Environment variables**, set `GEMINI_API_KEY`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `DYNAMODB_TABLE_NAME`.
5. Click **Save and Deploy**. Next.js 15 App Router will automatically build and deploy!

---

## 🛡️ DynamoDB Table Schema Setup

If connecting to your AWS account, create a DynamoDB table with the following parameters:
- **Table Name**: `CareerCopilotTracker`
- **Partition Key**: `id` (String)
- **Read/Write Capacity**: On-Demand (PAY_PER_REQUEST)
