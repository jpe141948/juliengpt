"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type Conversation = {
    id: string
    title: string
}

export default function ChatSidebar() {

    const supabase = createClient()
    const router = useRouter()

    const [conversations, setConversations] = useState<Conversation[]>([])
    const [search, setSearch] = useState("")

    async function loadConversations() {

        const { data } = await supabase
            .from("conversations")
            .select("*")
            .order("created_at", { ascending: false })

        if (!data) return

        setConversations(data)
    }

    useEffect(() => {

        loadConversations()

        const refresh = () => loadConversations()

        window.addEventListener("chat-updated", refresh)

        return () => window.removeEventListener("chat-updated", refresh)

    }, [])

    async function newChat() {

        const {
            data: { user }
        } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
            .from("conversations")
            .insert({
                user_id: user.id,
                title: "New Chat"
            })
            .select()
            .single()

        if (error || !data) {
            console.error(error)
            return
        }

        router.push(`/chat/${data.id}`)
        loadConversations()
    }

    async function deleteChat(id: string) {

        await supabase
            .from("conversations")
            .delete()
            .eq("id", id)

        loadConversations()
    }

    const filtered = conversations.filter(c =>
        c.title?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="w-64 bg-zinc-900 h-full flex flex-col">

            <div className="p-4 border-b border-zinc-800 flex flex-col gap-3">

                <button
                    onClick={newChat}
                    className="w-full bg-blue-600 p-2 rounded"
                >
                    New Chat
                </button>

                <input
                    placeholder="Search chats..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="p-2 rounded bg-zinc-800 text-sm"
                />

            </div>

            <div className="flex-1 overflow-y-auto">

                {filtered.map((chat) => (

                    <div
                        key={chat.id}
                        className="flex items-center justify-between p-3 hover:bg-zinc-800"
                    >

            <span
                onClick={() => router.push(`/chat/${chat.id}`)}
                className="cursor-pointer flex-1 truncate"
            >
              {chat.title || "New Chat"}
            </span>

                        <button
                            onClick={() => deleteChat(chat.id)}
                            className="text-red-400 text-sm ml-2"
                        >
                            ×
                        </button>

                    </div>

                ))}

            </div>

        </div>
    )
}