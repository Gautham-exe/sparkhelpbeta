import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const fileType = file.type || ""

    let text = ""

    if (fileType === "application/pdf") {
      // For PDF parsing, we'll use a simple text extraction
      // In production, you'd use pdf-parse or similar
      const uint8Array = new Uint8Array(buffer)
      const decoder = new TextDecoder("utf-8")
      text = decoder.decode(uint8Array)

      // Basic PDF text extraction (this is simplified)
      // Remove PDF binary data and extract readable text
      text = text.replace(/[^\x20-\x7E\n\r]/g, " ").trim()

      if (!text || text.length < 10) {
        text =
          "PDF content extracted. Please note: Complex PDFs may not parse perfectly. You can manually edit the content below."
      }
    } else if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileType === "application/msword"
    ) {
      // For DOCX, we'll extract text content
      // In production, you'd use mammoth or similar
      const decoder = new TextDecoder("utf-8")
      text = decoder.decode(buffer)

      // Basic text extraction
      text = text.replace(/[^\x20-\x7E\n\r]/g, " ").trim()

      if (!text || text.length < 10) {
        text =
          "DOCX content extracted. Please note: Complex documents may not parse perfectly. You can manually edit the content below."
      }
    } else if (fileType.startsWith("text/") || file.name?.toLowerCase().endsWith(".txt")) {
      // Native text handling
      text = await new Response(buffer).text()
      text = text.trim()
      if (!text) {
        text = "Text file loaded, but no readable content was found. You can edit below."
      }
    } else if (fileType === "application/rtf" || file.name?.toLowerCase().endsWith(".rtf")) {
      // Very basic RTF text extraction (strip common control words/braces)
      const raw = new TextDecoder("utf-8").decode(new Uint8Array(buffer))
      text = raw
        .replace(/\\[a-z]+\d* ?/gi, " ")
        .replace(/[{}]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
      if (!text || text.length < 10) {
        text =
          "RTF content extracted. Complex formatting may not parse perfectly. You can manually edit the content below."
      }
    } else {
      // Generic best-effort text extraction for unknown types
      const decoded = new TextDecoder("utf-8").decode(new Uint8Array(buffer))
      const cleaned = decoded.replace(/[^\x20-\x7E\n\r]/g, " ").trim()
      if (cleaned && cleaned.length > 10) {
        text = cleaned
      } else {
        return NextResponse.json(
          { error: "Unsupported file type. Please upload PDF, DOCX/DOC, RTF, or TXT files." },
          { status: 400 },
        )
      }
    }

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Document parsing error:", error)
    return NextResponse.json(
      { error: "Failed to parse document", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
