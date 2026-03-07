import { ChatMessage } from "@/types/chat"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function ChatMessageBubble({
                                              message,
                                              onEdit,
                                              onRegenerate
                                          }: {
    message: ChatMessage
    onEdit: (id: string, content: string) => void
    onRegenerate: () => void
}) {

    const isUser = message.role === "user"

    function copy(text: string) {
        navigator.clipboard.writeText(text)
    }

    function edit() {
        const newText = prompt("Edit message", message.content)
        if (!newText) return
        onEdit(message.id, newText)
    }

    return (

        <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>

            <div className={`max-w-xl px-4 py-3 rounded-lg ${isUser ? "bg-blue-600" : "bg-zinc-800"}`}>

                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                </ReactMarkdown>

                <div className="flex gap-2 mt-2 text-xs opacity-70">

                    <button onClick={() => copy(message.content)}>
                        Copy
                    </button>

                    {isUser && (
                        <button onClick={edit}>
                            Edit
                        </button>
                    )}

                    {!isUser && (
                        <button onClick={onRegenerate}>
                            Regenerate
                        </button>
                    )}

                </div>

            </div>

        </div>

    )
}