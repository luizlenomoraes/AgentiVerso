import { NextResponse } from "next/server"
// @ts-ignore
import pdf from "pdf-parse"
// @ts-ignore
import mammoth from "mammoth"

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
        }

        const fileType = file.type
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        let text = ""

        // Processar baseado no tipo
        if (fileType === "application/pdf") {
            const data = await pdf(buffer)
            text = data.text
        } else if (
            fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            file.name.endsWith(".docx")
        ) {
            const result = await mammoth.extractRawText({ buffer })
            text = result.value
        } else if (fileType === "text/plain" || fileType === "text/markdown") {
            text = buffer.toString("utf-8")
        } else {
            return NextResponse.json(
                { error: "Tipo de arquivo não suportado. Use PDF, DOCX, TXT ou MD" },
                { status: 400 }
            )
        }

        // Limpar texto
        text = text
            .replace(/\s+/g, " ") // Múltiplos espaços
            .replace(/\n\n+/g, "\n") // Múltiplas quebras
            .trim()

        if (!text || text.length < 50) {
            return NextResponse.json(
                { error: "Arquivo vazio ou texto muito curto" },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            text,
            filename: file.name,
            size: text.length,
        })
    } catch (error: any) {
        console.error("Erro ao processar arquivo:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
