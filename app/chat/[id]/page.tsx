"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useParams, useSearchParams } from "next/navigation"
import ChatMessageBubble from "@/components/chat-message"
import ChatSidebar from "@/components/chat-sidebar"
import { ChatMessage } from "@/types/chat"
import { createClient } from "@/lib/supabase/client"
import { v4 as uuid } from "uuid"

export default function ChatPage() {

    const params = useParams()
    const conversationId = params.id as string

    const searchParams = useSearchParams()
    const firstMessage = searchParams.get("first")

    const supabase = useMemo(() => createClient(), [])

    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [model, setModel] = useState("gpt-5")
    const [sending, setSending] = useState(false)

    const [messagesLoaded, setMessagesLoaded] = useState(false)
    const [initialSent, setInitialSent] = useState(false)

    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadMessages()
    }, [conversationId])

    useEffect(() => {
        if (!firstMessage) return
        if (!messagesLoaded) return
        if (initialSent) return

        setInitialSent(true)
        sendMessage(firstMessage)
    }, [firstMessage, messagesLoaded])

    async function loadMessages() {

        const { data } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at")
            .limit(50)

        if (!data) {
            setMessagesLoaded(true)
            return
        }

        const formatted: ChatMessage[] = data.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content
        }))

        setMessages(formatted)
        setMessagesLoaded(true)
    }

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    async function sendMessage(customMessage?: string) {

        const messageToSend = customMessage ?? input

        if (!messageToSend.trim() || sending) return
        setSending(true)

        const userMessage = messageToSend

        const newMessages: ChatMessage[] = [
            ...messages,
            { id: uuid(), role: "user", content: userMessage }
        ]

        setMessages(newMessages)

        if (!customMessage) {
            setInput("")
        }

        await supabase.from("messages").insert({
            conversation_id: conversationId,
            role: "user",
            content: userMessage
        })

        if (messages.length === 0) {
            await supabase
                .from("conversations")
                .update({
                    title: userMessage.slice(0, 40)
                })
                .eq("id", conversationId)
        }

        const history = [
            ...messages,
            { role: "user", content: userMessage }
        ]

        const limitedHistory = history.slice(-20)

        const res = await fetch("/api/chat", {
            method: "POST",
            body: JSON.stringify({
                messages: limitedHistory,
                model,
                conversationId
            })
        })

        const reader = res.body?.getReader()
        const decoder = new TextDecoder()

        let assistantText = ""
        const assistantId = uuid()

        setMessages([
            ...newMessages,
            { id: assistantId, role: "assistant", content: "" }
        ])

        while (true) {

            const { done, value } = await reader!.read()

            if (done) break

            const chunk = decoder.decode(value)

            assistantText += chunk

            setMessages(prev => {
                const updated = [...prev]
                const index = updated.findIndex(m => m.id === assistantId)

                if (index !== -1) {
                    updated[index] = {
                        ...updated[index],
                        content: assistantText
                    }
                }

                return updated
            })
        }

        await supabase.from("messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: assistantText
        })

        window.dispatchEvent(new Event("chat-updated"))

        setSending(false)
    }

    return (
        <div className="flex h-screen">

            <ChatSidebar />

            <div className="flex flex-col flex-1">

                <div className="flex items-center justify-between p-4 border-b border-zinc-800">

                    <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="bg-zinc-800 px-3 py-2 rounded"
                    >
                        <option value="gpt-5">GPT-5</option>
                        <option value="gpt-5-mini">GPT-5-mini</option>
                        <option value="gpt-5.4">GPT-5.4</option>
                    </select>

                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

                    {messages.map((msg) => (
                        <ChatMessageBubble key={msg.id} message={msg} />
                    ))}

                    <div ref={bottomRef} />

                </div>

                <div className="border-t border-zinc-800 p-4 flex gap-2">

                    <textarea
                        className="flex-1 p-3 bg-zinc-800 rounded resize-none"
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Send a message..."
                        onKeyDown={(e) => {

                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                sendMessage()
                            }

                        }}
                    />

                    <button
                        onClick={() => sendMessage()}
                        disabled={sending}
                        className="bg-blue-600 px-4 py-2 rounded disabled:opacity-50"
                    >
                        Send
                    </button>

                </div>

            </div>

        </div>
    )
}