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

    if (!isUser) {
        return (
            <div className="w-full flex justify-center py-6">

                <div className="max-w-3xl w-full text-[15px] leading-relaxed">

                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                    </ReactMarkdown>

                    {message.content === "" && (
                        <span className="typing-cursor">▌</span>
                    )}

                    <div className="flex gap-3 mt-3 text-[#EAD9B7] opacity-60 hover:opacity-100 transition">

                        <Copy size={16} className="cursor-pointer" onClick={copy}/>

                        <RotateCcw
                            size={16}
                            className="cursor-pointer"
                            onClick={() => onRegenerate(message.id)}
                        />

                    </div>

                </div>

            </div>
        )
    }

    return (

        <div className="w-full flex justify-end py-6">

            <div className="max-w-xl">

                <div className="bg-[#1A3F38] text-[#F7E7CE] rounded-xl p-3">

                    {message.attachments && message.attachments.length > 0 && (

                        <div className="mb-3 flex gap-2 flex-wrap">

                            {message.attachments.map((a: any, i: number) => (

                                <img
                                    key={i}
                                    src={a.url}
                                    className="w-32 rounded-lg"
                                />

                            ))}

                        </div>

                    )}

                    {editing ? (
                        <textarea
                            className="w-full bg-[#214B42] p-2 rounded outline-none border border-[#C9B08B] resize-none"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                        />
                    ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                        </ReactMarkdown>
                    )}

                </div>

                <div className="flex gap-3 mt-2 text-[#EAD9B7] opacity-60 hover:opacity-100 transition">

                    <Copy size={16} className="cursor-pointer" onClick={copy}/>

                    {!editing && (
                        <Pencil size={16} className="cursor-pointer" onClick={() => setEditing(true)}/>
                    )}

                    {editing && (
                        <Check size={16} className="cursor-pointer" onClick={saveEdit}/>
                    )}

                </div>

            </div>

        </div>

    )
}