"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import ChatSidebar from "@/components/chat-sidebar"
import ChatInput from "@/components/chat-input"

export default function HomePage() {

    const router = useRouter()
    const supabase = useMemo(() => createClient(), [])

    const [input, setInput] = useState("")
    const [model, setModel] = useState("gpt-5")
    const [files, setFiles] = useState<File[]>([])
    const [sending, setSending] = useState(false)

    async function startChat() {

        if (!input.trim()) return
        setSending(true)

        const {
            data: { user }
        } = await supabase.auth.getUser()

        if (!user) {
            router.push("/login")
            return
        }

        const { data, error } = await supabase
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

            <ChatSidebar />

            <div className="flex-1 flex items-center justify-center bg-[#102C26]">

                <div className="w-full">

                    <ChatInput
                        input={input}
                        setInput={setInput}
                        model={model}
                        setModel={setModel}
                        files={files}
                        setFiles={setFiles}
                        sending={sending}
                        onSend={startChat}
                        onStop={() => {}}
                    />

                </div>

            </div>

        </div>
    )
}