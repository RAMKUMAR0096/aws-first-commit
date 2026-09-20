import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { JobApplication } from "./mock-data";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "CareerCopilotTracker";
const AWS_REGION = process.env.AWS_REGION || "us-east-1";

// In-memory store fallback ONLY when AWS credentials are NOT provided in environment
let inMemoryStore: JobApplication[] = [];
let isTableInitialized = false;

function getDynamoDocumentClient(): DynamoDBDocumentClient | null {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey || accessKeyId.trim() === "" || accessKeyId.includes("your_aws")) {
    return null;
  }

  try {
    const client = new DynamoDBClient({
      region: AWS_REGION,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    return DynamoDBDocumentClient.from(client);
  } catch (err) {
    console.warn("⚠️ Unable to initialize AWS DynamoDB client:", err);
    return null;
  }
}

/**
 * Ensures the DynamoDB table exists in AWS.
 */
async function ensureTableExists(docClient: DynamoDBDocumentClient): Promise<void> {
  if (isTableInitialized) return;

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;

  const rawClient = new DynamoDBClient({
    region: AWS_REGION,
    credentials: { accessKeyId, secretAccessKey },
  });

  try {
    await rawClient.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    isTableInitialized = true;
  } catch (error: any) {
    if (error.name === "ResourceNotFoundException") {
      console.log(`🔨 DynamoDB table "${TABLE_NAME}" not found. Creating table on AWS...`);
      try {
        await rawClient.send(
          new CreateTableCommand({
            TableName: TABLE_NAME,
            AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
            KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
            BillingMode: "PAY_PER_REQUEST",
          })
        );
        isTableInitialized = true;
        console.log(`✅ Table "${TABLE_NAME}" created successfully on AWS DynamoDB.`);
      } catch (createErr) {
        console.error("❌ Failed to create DynamoDB table:", createErr);
      }
    } else {
      console.warn("⚠️ DescribeTable check:", error.message);
    }
  }
}

/**
 * Fetch applications belonging strictly to the authenticated user ID from AWS DynamoDB.
 */
export async function getApplicationsByUserId(userId: string): Promise<{ data: JobApplication[]; isMock: boolean }> {
  const docClient = getDynamoDocumentClient();

  if (!docClient) {
    console.warn("⚠️ AWS Credentials not configured. Using in-memory store fallback.");
    const userApps = inMemoryStore.filter((a) => a.userId === userId);
    return { data: userApps, isMock: true };
  }

  try {
    await ensureTableExists(docClient);
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "#uid = :userId",
      ExpressionAttributeNames: { "#uid": "userId" },
      ExpressionAttributeValues: { ":userId": userId },
    });
    const response = await docClient.send(command);
    const userApps = (response.Items as JobApplication[]) || [];
    return { data: userApps, isMock: false };
  } catch (error: any) {
    console.error("❌ AWS DynamoDB Scan Error:", error);
    throw new Error(`AWS DynamoDB Error: ${error.message || "Failed to fetch applications from AWS DynamoDB"}`);
  }
}

/**
 * Get a single application by ID from AWS DynamoDB.
 */
export async function getApplicationById(id: string): Promise<JobApplication | null> {
  const docClient = getDynamoDocumentClient();

  if (!docClient) {
    return inMemoryStore.find((a) => a.id === id) || null;
  }

  try {
    await ensureTableExists(docClient);
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });
    const response = await docClient.send(command);
    return (response.Item as JobApplication) || null;
  } catch (error: any) {
    console.error("❌ AWS DynamoDB Get Item Error:", error);
    throw new Error(`AWS DynamoDB Error: ${error.message}`);
  }
}

/**
 * Create a new application in AWS DynamoDB associated with the authenticated user ID.
 */
export async function createApplication(
  application: Omit<JobApplication, "id">,
  userId: string
): Promise<{ application: JobApplication; isMock: boolean }> {
  const newApp: JobApplication = {
    ...application,
    userId,
    id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    appliedDate: application.appliedDate || new Date().toISOString().split("T")[0],
  };

  const docClient = getDynamoDocumentClient();

  if (!docClient) {
    inMemoryStore.unshift(newApp);
    return { application: newApp, isMock: true };
  }

  try {
    await ensureTableExists(docClient);
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: newApp,
    });
    await docClient.send(command);
    console.log(`✅ Application ${newApp.id} persisted to AWS DynamoDB for user ${userId}`);
    return { application: newApp, isMock: false };
  } catch (error: any) {
    console.error("❌ AWS DynamoDB Put Item Error:", error);
    throw new Error(`AWS DynamoDB Error: ${error.message || "Failed to save application to AWS DynamoDB"}`);
  }
}

/**
 * Update status of an application in AWS DynamoDB, verifying user ownership.
 */
export async function updateApplicationStatus(
  id: string,
  status: JobApplication["status"],
  userId: string
): Promise<{ success: boolean; isMock: boolean }> {
  const docClient = getDynamoDocumentClient();

  if (!docClient) {
    const foundIndex = inMemoryStore.findIndex((a) => a.id === id);
    if (foundIndex !== -1) {
      if (inMemoryStore[foundIndex].userId !== userId) {
        throw new Error("Forbidden: You do not own this application.");
      }
      inMemoryStore[foundIndex].status = status;
    }
    return { success: true, isMock: true };
  }

  try {
    await ensureTableExists(docClient);
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: "SET #st = :status",
      ConditionExpression: "#uid = :userId",
      ExpressionAttributeNames: { "#st": "status", "#uid": "userId" },
      ExpressionAttributeValues: { ":status": status, ":userId": userId },
    });
    await docClient.send(command);
    return { success: true, isMock: false };
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      throw new Error("Forbidden: You do not own this application.");
    }
    console.error("❌ AWS DynamoDB Update Error:", error);
    throw new Error(`AWS DynamoDB Error: ${error.message}`);
  }
}

/**
 * Delete an application from AWS DynamoDB, verifying user ownership.
 */
export async function deleteApplication(id: string, userId: string): Promise<{ success: boolean; isMock: boolean }> {
  const docClient = getDynamoDocumentClient();

  if (!docClient) {
    inMemoryStore = inMemoryStore.filter((a) => a.id !== id);
    return { success: true, isMock: true };
  }

  try {
    await ensureTableExists(docClient);
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
      ConditionExpression: "#uid = :userId",
      ExpressionAttributeNames: { "#uid": "userId" },
      ExpressionAttributeValues: { ":userId": userId },
    });
    await docClient.send(command);
    return { success: true, isMock: false };
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      throw new Error("Forbidden: You do not own this application.");
    }
    console.error("❌ AWS DynamoDB Delete Error:", error);
    throw new Error(`AWS DynamoDB Error: ${error.message}`);
  }
}

