import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { JobApplication, INITIAL_MOCK_APPLICATIONS } from "./mock-data";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "CareerCopilotTracker";
const AWS_REGION = process.env.AWS_REGION || "us-east-1";

// In-memory fallback state for smooth judge demos if AWS credentials are unconfigured
let inMemoryStore: JobApplication[] = [...INITIAL_MOCK_APPLICATIONS];

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

export async function getAllApplications(): Promise<{ data: JobApplication[]; isMock: boolean }> {
  const docClient = getDynamoDocumentClient();

  if (!docClient) {
    return { data: inMemoryStore, isMock: true };
  }

  try {
    const command = new ScanCommand({ TableName: TABLE_NAME });
    const response = await docClient.send(command);
    
    if (response.Items && response.Items.length > 0) {
      return { data: response.Items as JobApplication[], isMock: false };
    }
    
    return { data: inMemoryStore, isMock: true };
  } catch (error) {
    console.warn("⚠️ DynamoDB Scan failed or table not found. Using in-memory fallback:", error);
    return { data: inMemoryStore, isMock: true };
  }
}

export async function createApplication(application: Omit<JobApplication, "id">): Promise<{ application: JobApplication; isMock: boolean }> {
  const newApp: JobApplication = {
    ...application,
    id: `app-${Date.now()}`,
    appliedDate: application.appliedDate || new Date().toISOString().split("T")[0],
  };

  const docClient = getDynamoDocumentClient();

  if (!docClient) {
    inMemoryStore.unshift(newApp);
    return { application: newApp, isMock: true };
  }

  try {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: newApp,
    });
    await docClient.send(command);
    return { application: newApp, isMock: false };
  } catch (error) {
    console.warn("⚠️ DynamoDB Put Item failed. Falling back to in-memory store:", error);
    inMemoryStore.unshift(newApp);
    return { application: newApp, isMock: true };
  }
}

export async function updateApplicationStatus(
  id: string,
  status: JobApplication["status"]
): Promise<{ success: boolean; isMock: boolean }> {
  const docClient = getDynamoDocumentClient();

  // Always update in-memory as well for immediate UI consistency
  const foundIndex = inMemoryStore.findIndex((a) => a.id === id);
  if (foundIndex !== -1) {
    inMemoryStore[foundIndex].status = status;
  }

  if (!docClient) {
    return { success: true, isMock: true };
  }

  try {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: "SET #st = :status",
      ExpressionAttributeNames: { "#st": "status" },
      ExpressionAttributeValues: { ":status": status },
    });
    await docClient.send(command);
    return { success: true, isMock: false };
  } catch (error) {
    console.warn("⚠️ DynamoDB Update Item failed:", error);
    return { success: true, isMock: true };
  }
}

export async function deleteApplication(id: string): Promise<{ success: boolean; isMock: boolean }> {
  inMemoryStore = inMemoryStore.filter((a) => a.id !== id);

  const docClient = getDynamoDocumentClient();
  if (!docClient) {
    return { success: true, isMock: true };
  }

  try {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });
    await docClient.send(command);
    return { success: true, isMock: false };
  } catch (error) {
    console.warn("⚠️ DynamoDB Delete Item failed:", error);
    return { success: true, isMock: true };
  }
}

export function resetInMemoryStoreToMock(): JobApplication[] {
  inMemoryStore = [...INITIAL_MOCK_APPLICATIONS];
  return inMemoryStore;
}
