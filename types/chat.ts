export type ChatMessage = {
    id: string
    role: "user" | "assistant" | "system"
    content: string
    attachments?: { url: string }[]
}