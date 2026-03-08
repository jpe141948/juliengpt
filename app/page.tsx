"use client"

import {useState, useMemo} from "react"
import {createClient} from "@/lib/supabase/client"
import {useRouter} from "next/navigation"
import ChatSidebar from "@/components/chat-sidebar"

export default function HomePage() {

    const router = useRouter()
    const supabase = useMemo(() => createClient(), [])

    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)

    async function startChat() {

        if (!input.trim()) return
        setLoading(true)

        const {
            data: {user}
        } = await supabase.auth.getUser()

        if (!user) {
            router.push("/login")
            return
        }

        const {data, error} = await supabase
            .from("conversations")
            .insert({
                user_id: user.id,
                title: input.slice(0, 40)
            })
            .select()
            .single()

        if (error || !data) {
            console.error(error)
            return
        }

        router.push(`/chat/${data.id}?first=${encodeURIComponent(input)}`)
    }

    return (

        <div className="app-shell flex">

            <ChatSidebar/>

            <div className="flex-1 flex items-center justify-center bg-zinc-950">

                <div className="w-full max-w-xl flex flex-col gap-4">

                <textarea
                    className="w-full p-4 bg-zinc-800 rounded resize-none"
                    rows={2}
                    value={input}
                    placeholder="Ask anything..."
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {

                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            startChat()
                        }

                    }}
                />

                    <button
                        onClick={startChat}
                        disabled={loading}
                        className="bg-blue-600 p-3 rounded disabled:opacity-50"
                    >
                        Start Chat
                    </button>

                </div>

            </div>
        </div>
    )
}