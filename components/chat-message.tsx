import { useState } from "react"
import { ChatMessage } from "@/types/chat"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Copy, Pencil, RotateCcw, Check } from "lucide-react"

export default function ChatMessageBubble({
                                              message,
                                              onEdit,
                                              onRegenerate
                                          }: {
    message: ChatMessage
    onEdit: (id: string, content: string) => void
    onRegenerate: (id: string) => void
}) {

    const isUser = message.role === "user"
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(message.content)

    function copy() {
        navigator.clipboard.writeText(message.content)
    }

    function saveEdit() {
        onEdit(message.id, draft)
        setEditing(false)
    }

    return (

        <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>

            <div className={`max-w-xl px-4 py-3 rounded-lg ${isUser ? "bg-blue-600" : "bg-zinc-800"}`}>

                {editing ? (
                    <textarea
                        className="w-full bg-transparent outline-none resize-none"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                    />
                ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                    </ReactMarkdown>
                )}

                <div className="flex gap-3 mt-2 text-zinc-400">

                    <Copy
                        size={16}
                        className="cursor-pointer hover:text-white"
                        onClick={copy}
                    />

                    {isUser && !editing && (
                        <Pencil
                            size={16}
                            className="cursor-pointer hover:text-white"
                            onClick={() => setEditing(true)}
                        />
                    )}

                    {editing && (
                        <Check
                            size={16}
                            className="cursor-pointer hover:text-white"
                            onClick={saveEdit}
                        />
                    )}

                    {!isUser && (
                        <RotateCcw
                            size={16}
                            className="cursor-pointer hover:text-white"
                            onClick={() => onRegenerate(message.id)}
                        />
                    )}

                </div>

            </div>

        </div>

    )
}