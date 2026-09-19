/**
 * Extracts raw text from a PDF Buffer or converts plain text string.
 */
export async function extractTextFromDocument(fileBuffer: Buffer, mimeType?: string): Promise<string> {
  try {
    if (mimeType === "application/pdf" || isPdfBuffer(fileBuffer)) {
      // Dynamic require for pdf-parse compatibility
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(fileBuffer);
      return data.text.trim();
    }
    // Fallback: UTF-8 text file parsing
    return fileBuffer.toString("utf-8").trim();
  } catch (error) {
    console.warn("PDF extraction fallback to UTF-8 text:", error);
    return fileBuffer.toString("utf-8").trim();
  }
}

function isPdfBuffer(buffer: Buffer): boolean {
  // Check PDF magic header %PDF (bytes: 0x25 0x50 0x44 0x46)
  return buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
}
