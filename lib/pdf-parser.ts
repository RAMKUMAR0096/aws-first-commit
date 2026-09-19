import zlib from "zlib";
import "./polyfill";

/**
 * Robust, zero-crash PDF & Document text extractor for Next.js Server Components.
 * Handles compressed / uncompressed PDF streams without requiring canvas or external worker threads.
 */
export async function extractTextFromDocument(fileBuffer: Buffer, mimeType?: string): Promise<string> {
  let extractedText = "";

  try {
    if (mimeType === "application/pdf" || isPdfBuffer(fileBuffer)) {
      // Strategy 1: Attempt pdf-parse library if available without worker errors
      try {
        const pdfModule = require("pdf-parse");
        const uint8 = new Uint8Array(fileBuffer);

        if (pdfModule && typeof pdfModule.PDFParse === "function") {
          const parser = new pdfModule.PDFParse(uint8);
          const data = await parser.getText();
          if (data && typeof data.text === "string" && data.text.trim().length >= 10) {
            extractedText = data.text;
          }
        } else if (typeof pdfModule === "function") {
          const data = await pdfModule(fileBuffer);
          if (data && typeof data.text === "string" && data.text.trim().length >= 10) {
            extractedText = data.text;
          }
        }
      } catch (pdfErr) {
        console.warn("⚠️ pdf-parse library worker error (swallowing fallback):", pdfErr instanceof Error ? pdfErr.message : pdfErr);
      }

      // Strategy 2: Native PDF stream extractor (handles FlateDecode compressed & uncompressed streams)
      if (!extractedText || extractedText.trim().length < 10) {
        console.log("🔄 Running native zero-dependency PDF stream extractor...");
        extractedText = extractTextFromPdfStreams(fileBuffer);
      }

      // Normalize and clean extracted text
      const cleanedText = cleanPdfText(extractedText);

      if (cleanedText.length >= 10) {
        console.log(`📄 PDF extraction successful! Extracted ${cleanedText.length} characters.`);
        console.log(`📝 Resume Snippet:\n"""\n${cleanedText.slice(0, 300)}...\n"""`);
        return cleanedText;
      }
      throw new Error("Could not extract readable text from the provided PDF file.");
    }

    // Strategy 3: Plain text file fallback
    const textContent = fileBuffer.toString("utf-8").trim();
    if (textContent.length >= 10) {
      return textContent;
    }
    throw new Error("Uploaded file contains insufficient text.");
  } catch (error: any) {
    console.error("❌ PDF text extraction error:", error);
    throw new Error(`Failed to extract readable text from PDF: ${error?.message || String(error)}`);
  }
}

/**
 * Universal Native PDF Stream Extractor
 * Parses uncompressed & FlateDecode zlib-compressed PDF text streams directly.
 */
function extractTextFromPdfStreams(pdfBuffer: Buffer): string {
  const extractedChunks: string[] = [];

  try {
    const rawString = pdfBuffer.toString("latin1");
    
    // Match stream objects (compressed or uncompressed)
    const streamRegex = /\/Filter\s*\/FlateDecode[\s\S]*?stream[\r\n]+([\s\S]*?)[\r\n]+endstream|stream[\r\n]+([\s\S]*?)[\r\n]+endstream/gi;
    let match: RegExpExecArray | null;

    while ((match = streamRegex.exec(rawString)) !== null) {
      let streamText = "";
      const isCompressed = match[0].includes("/FlateDecode");
      const matchIndex = match.index;

      if (isCompressed) {
        try {
          const streamMarker = "stream";
          const streamPos = pdfBuffer.indexOf(streamMarker, matchIndex);
          if (streamPos !== -1) {
            let startPos = streamPos + streamMarker.length;
            if (pdfBuffer[startPos] === 0x0d) startPos++;
            if (pdfBuffer[startPos] === 0x0a) startPos++;

            const endPos = pdfBuffer.indexOf("endstream", startPos);
            if (endPos !== -1) {
              const compressedSlice = pdfBuffer.subarray(startPos, endPos);
              let decompressed: Buffer | null = null;
              try {
                decompressed = zlib.inflateSync(compressedSlice);
              } catch {
                try {
                  decompressed = zlib.inflateRawSync(compressedSlice);
                } catch {
                  try {
                    decompressed = zlib.unzipSync(compressedSlice);
                  } catch {}
                }
              }
              if (decompressed) {
                streamText = decompressed.toString("latin1");
              }
            }
          }
        } catch {
          // If inflation fails, proceed to text operator scan
        }
      }

      if (!streamText) {
        streamText = match[1] || match[2] || "";
      }

      if (streamText) {
        parseTextFromStream(streamText, extractedChunks);
      }
    }

    // Direct scan if stream blocks were non-standard
    if (extractedChunks.length === 0) {
      parseTextFromStream(rawString, extractedChunks);
    }

    return extractedChunks.join(" ");
  } catch (err) {
    console.error("Error in native PDF stream parser:", err);
    return "";
  }
}

function parseTextFromStream(streamText: string, chunks: string[]) {
  // 1. Literal strings: (Hello World) Tj
  const tjRegex = /\(([^)]*)\)\s*Tj/g;
  let m: RegExpExecArray | null;
  while ((m = tjRegex.exec(streamText)) !== null) {
    if (m[1] && m[1].trim()) {
      chunks.push(m[1].trim());
    }
  }

  // 2. Array strings: [(React) -10 (TypeScript)] TJ
  const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
  while ((m = tjArrayRegex.exec(streamText)) !== null) {
    const innerParens = /\(([^)]*)\)/g;
    let pm: RegExpExecArray | null;
    let combined = "";
    while ((pm = innerParens.exec(m[1])) !== null) {
      combined += pm[1] + " ";
    }
    if (combined.trim()) {
      chunks.push(combined.trim());
    }
  }

  // 3. Hex strings: <48656c6c6f> Tj
  const hexRegex = /<([0-9a-fA-F]+)>\s*Tj/g;
  while ((m = hexRegex.exec(streamText)) !== null) {
    const hex = m[1];
    let decoded = "";
    if (hex.length >= 4 && hex.startsWith("00")) {
      // UTF-16BE
      for (let i = 0; i < hex.length; i += 4) {
        const code = parseInt(hex.substring(i, i + 4), 16);
        if (code > 0) decoded += String.fromCharCode(code);
      }
    } else {
      // ASCII/Latin1
      for (let i = 0; i < hex.length; i += 2) {
        const code = parseInt(hex.substring(i, i + 2), 16);
        if (code > 0) decoded += String.fromCharCode(code);
      }
    }
    if (decoded.trim()) {
      chunks.push(decoded.trim());
    }
  }
}

function cleanPdfText(text: string): string {
  return text
    .replace(/\x00/g, "") // strip null bytes
    .replace(/\\([()])/g, "$1") // unescape PDF parens \( \)
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/-- \d+ of \d+ --/g, "")
    .replace(/Page \d+ of \d+/gi, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

function isPdfBuffer(buffer: Buffer): boolean {
  return buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
}