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

            <div className="flex-1 flex items-center justify-center bg-[#102C26]">

                <div className="w-full max-w-xl">

                    <div className="flex items-center gap-3 bg-[#1A3F38] rounded-xl px-4 py-4">

                        <select
                            className="bg-transparent text-[#F7E7CE] text-sm outline-none"
                        >
                            <option>GPT-5</option>
                            <option>GPT-5 mini</option>
                        </select>

                        <textarea
                            className="flex-1 bg-transparent text-[#F7E7CE] resize-none outline-none"
                            rows={1}
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
                            className="bg-[#C9B08B] text-[#102C26] px-4 py-2 rounded-lg"
                        >
                            ↑
                        </button>

                    </div>

                </div>

            </div>
        </div>
    )
}