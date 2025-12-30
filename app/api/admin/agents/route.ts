import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const { name, description, photo_url, system_prompt } = await request.json()

    const { data: agent, error } = await supabase
      .from("agents")
      .insert({
        name,
        description,
        photo_url,
        system_prompt,
        created_by: user.id,
        is_public: true,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating agent:", error)
      return NextResponse.json({ error: "Erro ao criar agente" }, { status: 500 })
    }

    return NextResponse.json({ agent })
  } catch (error) {
    console.error("[v0] Admin API error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
