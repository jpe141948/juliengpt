import { openai } from "@/lib/openai"
import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"

export async function POST(req: Request) {

    const supabaseAuth = await createServerClient()

    const {
        data: { user }
    } = await supabaseAuth.auth.getUser()

    if (!user) {
        return new Response("Unauthorized", { status: 401 })
    }

    const allowedUsers = [
        "peters.julien@icloud.com"
    ]

    if (!allowedUsers.includes(user.email!)) {
        return new Response("Access denied", { status: 403 })
    }

    const { messages, model, conversationId } = await req.json()

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const systemPrompt = {
        role: "system",
        content: "You are a helpful assistant. Be concise and accurate."
    }

    const cleanMessages = messages.map((m: any) => ({
        role: m.role,
        content: m.content
    }))

    const response = await openai.responses.create({
        model: model || "gpt-5",
        input: [
            systemPrompt,
            ...cleanMessages
        ],
        stream: true
    })

    const encoder = new TextEncoder()

    let inputTokens = 0
    let outputTokens = 0

    const stream = new ReadableStream({
        async start(controller) {

            for await (const chunk of response) {

                if (chunk.type === "response.output_text.delta") {
                    controller.enqueue(encoder.encode(chunk.delta))
                }

                if (chunk.type === "response.completed") {
                    inputTokens = chunk.response.usage?.input_tokens || 0
                    outputTokens = chunk.response.usage?.output_tokens || 0
                }

            }

            await supabase.from("usage_logs").insert({
                conversation_id: conversationId,
                model,
                input_tokens: inputTokens,
                output_tokens: outputTokens
            })

            controller.close()
        }
    })

    return new Response(stream)
}