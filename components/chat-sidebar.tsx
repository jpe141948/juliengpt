"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Trash2, Plus } from "lucide-react"

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

        <div className="w-64 bg-[#1A3F38] h-full flex flex-col border-r border-[#214B42]">

            <div className="p-4 flex flex-col gap-3">

                <button
                    onClick={newChat}
                    className="flex items-center justify-center gap-2 bg-[#C9B08B] text-[#102C26] p-2 rounded-lg hover:opacity-90 transition"
                >
                    <Plus size={16} />
                    New Chat
                </button>

                <input
                    placeholder="Search chats..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#214B42] text-[#F7E7CE] p-2 rounded-lg text-sm outline-none placeholder:text-[#EAD9B7]"
                />

            </div>

            <div className="flex-1 overflow-y-auto">

                {filtered.map((chat) => (

                    <div
                        key={chat.id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-[#214B42] cursor-pointer transition"
                    >

            <span
                onClick={() => router.push(`/chat/${chat.id}`)}
                className="flex-1 truncate text-sm text-[#F7E7CE]"
            >
              {chat.title || "New Chat"}
            </span>

                        <Trash2
                            size={16}
                            onClick={() => deleteChat(chat.id)}
                            className="text-[#EAD9B7] opacity-60 hover:opacity-100 cursor-pointer transition"
                        />

                    </div>

                ))}

            </div>

        </div>

    )
}