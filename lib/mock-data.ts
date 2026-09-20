export interface PartialSkill {
  skill: string;
  gap: string;
}

export interface MissingSkill {
  skill: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  targetSkills: string[];
  estimatedHours: number;
  resourceType: 'DOCUMENTATION' | 'PROJECT' | 'TUTORIAL';
  completed?: boolean;
}

export interface LearningRoadmap {
  day7: RoadmapItem[];
  day14: RoadmapItem[];
  day30: RoadmapItem[];
}

export interface InterviewQuestion {
  id: string;
  type: 'TECHNICAL' | 'BEHAVIORAL' | 'SYSTEM_DESIGN';
  question: string;
  contextFromResume: string;
  sampleAnswer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  keyPointsToCover: string[];
}

export interface AnalysisResult {
  matchScore: number;
  summary: string;
  matchedSkills: string[];
  partialSkills: PartialSkill[];
  missingSkills: MissingSkill[];
  learningRoadmap: LearningRoadmap;
  interviewQuestions: InterviewQuestion[];
}

export interface JobApplication {
  id: string;
  userId?: string;
  companyName: string;
  roleTitle: string;
  location: string;
  salaryRange?: string;
  appliedDate: string;
  status: 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
  jobUrl?: string;
  notes?: string;
  matchScore?: number;
}

export const MOCK_RESUME_TEXT = `
AARAV SHARMA
Computer Science & Engineering Student | Final Year (2026 Batch)
Email: aarav.sharma@example.edu | GitHub: github.com/aaravsharma | LinkedIn: linkedin.in/aaravsharma

SUMMARY
Enthusiastic Full-Stack Developer with hands-on experience building web applications using React, Next.js, Node.js, and REST APIs. Passionate about cloud technologies and building clean, responsive user interfaces.

SKILLS
- Languages & Core: JavaScript (ES6+), TypeScript, HTML5, CSS3, SQL
- Frontend: React.js, Next.js (App Router), Tailwind CSS, Redux Toolkit, HTML/CSS
- Backend: Node.js, Express.js, RESTful APIs, PostgreSQL, MongoDB Basics
- Developer Tools: Git, GitHub, VS Code, Postman, Vercel Deployment

PROJECTS
1. E-Commerce Platform (Campus Mart) | Next.js, React, Node.js, PostgreSQL
   - Developed a full-stack campus marketplace where students buy/sell textbooks and gear.
   - Built JWT authentication and responsive UI using Tailwind CSS, serving 1,200+ monthly active users.
   - Integrated Razorpay payment gateway for secure digital payments.

2. Real-Time Task Management System | React, Express.js, Socket.io
   - Created a collaborative task board with live websocket updates for agile student team projects.
   - Implemented state management using Redux Toolkit and REST APIs for project CRUD operations.

EXPERIENCE
Frontend Developer Intern | TechNova Solutions (May 2025 – July 2025)
- Migrated legacy jQuery portal pages to modern React.js components, improving page load speed by 35%.
- Collaborated with UX team to build accessible components adhering to WCAG guidelines.

EDUCATION
B.Tech in Computer Science and Engineering | BITS Pilani (2022 - 2026) | CGPA: 8.7/10
`;

export const MOCK_JOB_DESCRIPTION = `
Position: Junior Cloud Full-Stack Engineer
Company: CloudScale Innovations India

We are seeking an ambitious Junior Cloud Full-Stack Engineer to join our core SaaS platform team.

Requirements:
- Strong proficiency in modern JavaScript/TypeScript, React, and Next.js.
- Solid understanding of REST APIs, Node.js, and relational database management.
- Hands-on experience or working knowledge of AWS Services (EC2, S3, DynamoDB, Lambda).
- Experience with Docker containerization and basic Kubernetes concepts.
- Familiarity with CI/CD automation tools like GitHub Actions.
- Knowledge of NoSQL databases (DynamoDB or MongoDB) and data modeling.
- Strong problem-solving, collaboration, and verbal/written communication skills.

Nice to Have:
- Experience with AWS CDK or Terraform infrastructure as code.
- Basic understanding of GraphQL APIs and system design concepts.
`;

export const MOCK_ANALYSIS_RESULT: AnalysisResult = {
  matchScore: 78,
  summary: "Aarav demonstrates a strong foundation in modern frontend web development (Next.js, React, TypeScript, Tailwind) and RESTful Node.js services. To reach a 90%+ target match for CloudScale's Cloud Engineer role, Aarav should focus on acquiring practical experience with AWS cloud services (DynamoDB, Lambda) and containerization tools (Docker, GitHub Actions).",
  matchedSkills: [
    "JavaScript / TypeScript",
    "React.js & Next.js (App Router)",
    "Tailwind CSS & Responsive UI",
    "Node.js & Express.js REST APIs",
    "Git & GitHub Version Control",
    "Relational Databases (PostgreSQL)",
    "JWT Authentication & Security"
  ],
  partialSkills: [
    {
      skill: "AWS Services",
      gap: "Possesses basic understanding of cloud hosting (Vercel), but lacks direct hands-on project experience with core AWS services (EC2, S3, Lambda, DynamoDB)."
    },
    {
      skill: "NoSQL Databases",
      gap: "Lists basic MongoDB knowledge, but job requires specific NoSQL data modeling for AWS DynamoDB."
    },
    {
      skill: "System Design & State",
      gap: "Strong local state experience with Redux Toolkit; needs deeper exposure to microservices communication and serverless patterns."
    }
  ],
  missingSkills: [
    {
      skill: "Docker & Containerization",
      priority: "HIGH",
      category: "DevOps & Infrastructure"
    },
    {
      skill: "AWS DynamoDB NoSQL Data Modeling",
      priority: "HIGH",
      category: "Cloud Data"
    },
    {
      skill: "CI/CD Pipelines (GitHub Actions)",
      priority: "MEDIUM",
      category: "Automation"
    },
    {
      skill: "AWS Serverless (Lambda & S3 SDK)",
      priority: "MEDIUM",
      category: "AWS Cloud"
    },
    {
      skill: "GraphQL APIs",
      priority: "LOW",
      category: "API Protocols"
    }
  ],
  learningRoadmap: {
    day7: [
      {
        id: "r1",
        title: "Docker Fundamentals & Containerization",
        description: "Containerize your Next.js and Node.js projects. Learn Dockerfile creation, multi-stage builds, docker-compose for multi-container apps.",
        targetSkills: ["Docker & Containerization"],
        estimatedHours: 8,
        resourceType: "TUTORIAL",
        completed: true
      },
      {
        id: "r2",
        title: "AWS DynamoDB Core Concepts & SDK v3",
        description: "Learn DynamoDB partition keys, sort keys, single-table design principles, and integrate @aws-sdk/client-dynamodb in a Next.js API route.",
        targetSkills: ["AWS DynamoDB NoSQL Data Modeling"],
        estimatedHours: 6,
        resourceType: "DOCUMENTATION",
        completed: false
      }
    ],
    day14: [
      {
        id: "r3",
        title: "Build & Deploy AWS Serverless Lambda + S3 App",
        description: "Create an AWS S3 file uploader microservice with Node.js SDK and trigger AWS Lambda functions on object creation.",
        targetSkills: ["AWS Serverless (Lambda & S3 SDK)"],
        estimatedHours: 10,
        resourceType: "PROJECT",
        completed: false
      },
      {
        id: "r4",
        title: "Automate Workflows with GitHub Actions CI/CD",
        description: "Write custom GitHub Actions workflow file (.github/workflows/deploy.yml) to run automated ESLint tests and build check on push.",
        targetSkills: ["CI/CD Pipelines (GitHub Actions)"],
        estimatedHours: 5,
        resourceType: "TUTORIAL",
        completed: false
      }
    ],
    day30: [
      {
        id: "r5",
        title: "Full-Stack AWS Capstone: Deploy Next.js to AWS Amplify",
        description: "Deploy your AI Career Copilot app on AWS Amplify with environment variable management, DynamoDB integration, and custom domain setup.",
        targetSkills: ["AWS Cloud", "AWS DynamoDB", "CI/CD Pipelines"],
        estimatedHours: 14,
        resourceType: "PROJECT",
        completed: false
      },
      {
        id: "r6",
        title: "GraphQL & Apollo Server Integration",
        description: "Build a GraphQL schema with queries and mutations to complement your existing REST API backend architecture.",
        targetSkills: ["GraphQL APIs"],
        estimatedHours: 6,
        resourceType: "DOCUMENTATION",
        completed: false
      }
    ]
  },
  interviewQuestions: [
    {
      id: "iq1",
      type: "TECHNICAL",
      question: "In your Campus Mart project, you used PostgreSQL for relational data storage. How would you redesign the order history feature if you had to migrate it to Amazon DynamoDB for high throughput scalability?",
      contextFromResume: "Grounded in Campus Mart (Next.js, Node.js, PostgreSQL) project",
      sampleAnswer: "In PostgreSQL, orders and items are normalized across orders and order_items tables. In DynamoDB, I would use single-table design with Partition Key `USER#<userId>` and Sort Key `ORDER#<orderId>`. This allows querying all user orders in a single Query call with O(1) time complexity. For line items, I can store them as a JSON list attribute directly inside the Order item item to avoid multiple round-trips.",
      difficulty: "Hard",
      keyPointsToCover: [
        "Single-table design principles (PK/SK modeling)",
        "Avoiding relational joins in NoSQL",
        "Document attribute storage vs normalized tables",
        "Query vs Scan efficiency"
      ]
    },
    {
      id: "iq2",
      type: "TECHNICAL",
      question: "Your task management application uses Socket.io for live updates. If you were deploying this on AWS serverless architecture, how would AWS WebSockets via API Gateway differ from a traditional long-running Socket.io Node server?",
      contextFromResume: "Grounded in Real-Time Task Management System (Socket.io, Express) project",
      sampleAnswer: "Traditional Socket.io requires an active, stateful Node.js server process holding persistent TCP connections in memory. With AWS API Gateway WebSocket APIs, AWS handles connection management statelessly. When a client sends a message, API Gateway routes the event to an AWS Lambda function execution, saving idle compute costs and auto-scaling effortlessly.",
      difficulty: "Medium",
      keyPointsToCover: [
        "Stateful vs Serverless connection management",
        "API Gateway WebSocket routing ($connect, $disconnect, $default)",
        "Lambda integration cost efficiency",
        "DynamoDB connection ID storage"
      ]
    },
    {
      id: "iq3",
      type: "BEHAVIORAL",
      question: "During your internship at TechNova Solutions, you migrated legacy jQuery components to React. How did you ensure accessibility (WCAG) standards while maintaining project deadlines?",
      contextFromResume: "Grounded in TechNova Solutions Frontend Internship experience",
      sampleAnswer: "I prioritized accessibility by incorporating semantic HTML5 elements (nav, section, button) instead of plain divs, ensuring all interactive elements had ARIA attributes (`aria-expanded`, `aria-label`), and maintaining 4.5:1 color contrast. I integrated automated linting (`eslint-plugin-jsx-a11y`) to catch issues during development, which saved manual QA testing time.",
      difficulty: "Medium",
      keyPointsToCover: [
        "Semantic HTML5 over non-semantic elements",
        "Automated a11y tooling in build process",
        "Keyboard navigation & focus trapping",
        "Clear communication of deadline trade-offs"
      ]
    },
    {
      id: "iq4",
      type: "TECHNICAL",
      question: "Explain the App Router routing and caching mechanisms in Next.js 15 compared to traditional React SPA architecture.",
      contextFromResume: "Grounded in Campus Mart Next.js experience",
      sampleAnswer: "Next.js 15 App Router utilizes React Server Components (RSC) by default, rendering components on the server to reduce JavaScript bundle sizes sent to the browser. Routes are structured around file-system hierarchies (`app/route/page.tsx`). Dynamic server functions default to uncached execution, while static assets utilize optimized caching layers.",
      difficulty: "Easy",
      keyPointsToCover: [
        "React Server Components vs Client Components",
        "File-system based App Router convention",
        "Server-side rendering performance gains",
        "Zero-bundle size for server logic"
      ]
    }
  ]
};

export const INITIAL_MOCK_APPLICATIONS: JobApplication[] = [
  {
    id: "app-101",
    companyName: "CloudScale Innovations",
    roleTitle: "Junior Cloud Full-Stack Engineer",
    location: "Bengaluru, KA (Hybrid)",
    salaryRange: "₹8.5L - ₹11L / yr",
    appliedDate: "2026-09-12",
    status: "INTERVIEW",
    jobUrl: "https://cloudscale.example/careers/junior-cloud-engineer",
    notes: "Completed initial technical screening test. Next round is system design and live coding.",
    matchScore: 78
  },
  {
    id: "app-102",
    companyName: "NexusTech Labs",
    roleTitle: "Associate Frontend Developer (React/Next.js)",
    location: "Remote (India)",
    salaryRange: "₹7L - ₹9L / yr",
    appliedDate: "2026-09-08",
    status: "OFFER",
    jobUrl: "https://nexustech.example/jobs/react-dev",
    notes: "Received offer letter on Sep 18! Decision deadline is Sep 25.",
    matchScore: 92
  },
  {
    id: "app-103",
    companyName: "DataPulse Systems",
    roleTitle: "Graduate Engineer Trainee - Cloud",
    location: "Hyderabad, TS",
    salaryRange: "₹6.5L - ₹8L / yr",
    appliedDate: "2026-09-01",
    status: "APPLIED",
    jobUrl: "https://datapulse.example/careers/get-cloud",
    notes: "Application submitted via campus referral portal.",
    matchScore: 84
  },
  {
    id: "app-104",
    companyName: "FinTech Direct",
    roleTitle: "Software Engineer - Backend (Node.js)",
    location: "Mumbai, MH",
    salaryRange: "₹9L - ₹12L / yr",
    appliedDate: "2026-08-25",
    status: "REJECTED",
    jobUrl: "https://fintechdirect.example/jobs/backend-node",
    notes: "Position required 2+ years of Redis and Microservices experience.",
    matchScore: 65
  }
];
