import { ChatMessage } from "@/types/chat"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function ChatMessageBubble({ message }: { message: ChatMessage }) {

    const isUser = message.role === "user"

    function copy(text: string) {
        navigator.clipboard.writeText(text)
    }

    return (
        <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>

            <div
                className={`max-w-xl px-4 py-3 rounded-lg ${
                    isUser
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-800 text-white"
                }`}
            >

                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({ children }: any) {

                            const code = String(children)

                            return (
                                <div className="relative">

                                    <button
                                        onClick={() => copy(code)}
                                        className="absolute top-2 right-2 text-xs bg-zinc-700 px-2 py-1 rounded"
                                    >
                                        Copy
                                    </button>

                                    <pre className="bg-zinc-900 p-3 rounded overflow-x-auto">
                    <code>{code}</code>
                  </pre>

                                </div>
                            )
                        }
                    }}
                >
                    {message.content}
                </ReactMarkdown>

            </div>

        </div>
    )
}