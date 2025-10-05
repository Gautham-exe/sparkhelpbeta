import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { content, format } = await request.json()

    if (!content || !format) {
      return NextResponse.json({ error: "Missing content or format" }, { status: 400 })
    }

    if (format === "pdf") {
      // Generate simple PDF
      // In production, use jspdf or pdfkit
      const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length ${content.length + 50}
>>
stream
BT
/F1 12 Tf
50 750 Td
(${content.replace(/\n/g, ") Tj T* (")}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${400 + content.length}
%%EOF`

      return new NextResponse(pdfContent, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=edited-document.pdf",
        },
      })
    } else if (format === "docx") {
      // Generate simple DOCX (XML-based)
      // In production, use docx library
      const docxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>${content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`

      return new NextResponse(docxContent, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": "attachment; filename=edited-document.docx",
        },
      })
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Failed to export document", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
