import { useState } from "react"
import { ChatMessage } from "@/types/chat"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Copy, Pencil, RotateCcw, Check } from "lucide-react"
import FileModal from "@/components/file-modal"

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

    const [viewer, setViewer] = useState<any>(null)

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

                        <div className="mb-3 flex gap-3 flex-wrap">

                            {message.attachments.map((a: any, i: number) => {

                                const isImage = a.type?.startsWith("image")

                                return (

                                    <div
                                        key={i}
                                        onClick={() => setViewer(a)}
                                        className="cursor-pointer"
                                    >

                                        {isImage ? (
                                            <img
                                                src={a.url}
                                                className="max-w-xs rounded-lg border border-[#214B42]"
                                            />
                                        ) : (
                                            <div className="bg-[#214B42] px-3 py-2 rounded text-sm">
                                                {a.name}
                                            </div>
                                        )}

                                    </div>

                                )

                            })}

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
            <FileModal file={viewer} onClose={() => setViewer(null)} />
        </div>


    )
}