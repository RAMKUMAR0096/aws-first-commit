const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const path = require("path");
const fs = require("fs");

// Load .env.local manually
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...vals] = trimmed.split("=");
      process.env[key.trim()] = vals.join("=").trim();
    }
  });
}

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "CareerCopilotTracker";
const AWS_REGION = process.env.MY_AWS_REGION || process.env.APP_AWS_REGION || process.env.AWS_REGION || "us-east-1";

async function viewData() {
  console.log(`\n==================================================`);
  console.log(`🔍 Querying AWS DynamoDB Table: [${TABLE_NAME}] in Region: [${AWS_REGION}]`);
  console.log(`==================================================\n`);

  const accessKeyId = process.env.MY_AWS_ACCESS_KEY_ID || process.env.APP_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.MY_AWS_SECRET_ACCESS_KEY || process.env.APP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey || accessKeyId.includes("your_aws")) {
    console.error("❌ AWS Credentials missing in .env.local!");
    process.exit(1);
  }

  try {
    const client = new DynamoDBClient({
      region: AWS_REGION,
      credentials: { accessKeyId, secretAccessKey },
    });
    const docClient = DynamoDBDocumentClient.from(client);

    const response = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
    const items = response.Items || [];

    console.log(`📊 Total Items Found: ${items.length}\n`);
    if (items.length === 0) {
      console.log("ℹ️ No application records currently stored. Add an application in the web app to view it here!");
    } else {
      console.table(
        items.map((item) => ({
          ID: item.id,
          User: item.userId,
          Company: item.companyName,
          Role: item.roleTitle,
          Status: item.status,
          MatchScore: item.matchScore ? `${item.matchScore}%` : "N/A",
          AppliedDate: item.appliedDate,
        }))
      );
      console.log("\n📄 Full JSON Data:");
      console.log(JSON.stringify(items, null, 2));
    }
  } catch (err) {
    console.error("❌ Error fetching DynamoDB data:", err.message);
  }
}

viewData();
