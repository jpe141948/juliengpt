"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useParams, useSearchParams } from "next/navigation"
import ChatMessageBubble from "@/components/chat-message"
import ChatSidebar from "@/components/chat-sidebar"
import { ChatMessage } from "@/types/chat"
import { createClient } from "@/lib/supabase/client"
import { v4 as uuid } from "uuid"
import { Virtuoso } from "react-virtuoso"

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

    const abortRef = useRef<AbortController | null>(null)

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

    function stopGeneration() {
        abortRef.current?.abort()
        setSending(false)
    }

    async function regenerate(id: string) {

        const assistantIndex = messages.findIndex(m => m.id === id)

        if (assistantIndex === -1) return

        const userMessage = messages[assistantIndex - 1]

        if (!userMessage) return

        const trimmed = messages.slice(0, assistantIndex)

        setMessages(trimmed)

        const history = trimmed
            .filter(m => m.role !== "assistant" || m.content !== "")
            .map(m => ({
                role: m.role,
                content: m.content
            }))

        generateFromHistory(history.slice(-20))
    }

    function editMessage(id: string, content: string) {

        const index = messages.findIndex(m => m.id === id)

        if (index === -1) return

        const trimmed = [
            ...messages.slice(0, index),
            { ...messages[index], content }
        ]

        setMessages(trimmed)

        const history = trimmed.map(m => ({
            role: m.role,
            content: m.content
        }))

        generateFromHistory(history.slice(-20))
    }

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

        const history = [
            ...messages,
            { role: "user", content: userMessage }
        ]

        const limitedHistory = history.slice(-20)

        abortRef.current = new AbortController()

        const res = await fetch("/api/chat", {
            method: "POST",
            body: JSON.stringify({
                messages: limitedHistory,
                model,
                conversationId
            }),
            signal: abortRef.current.signal
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

    async function generateFromHistory(history: any[]) {

        if (sending) return

        setSending(true)

        abortRef.current = new AbortController()

        const res = await fetch("/api/chat", {
            method: "POST",
            body: JSON.stringify({
                messages: history,
                model,
                conversationId
            }),
            signal: abortRef.current.signal
        })

        const reader = res.body?.getReader()
        const decoder = new TextDecoder()

        let assistantText = ""
        const assistantId = uuid()

        setMessages(prev => [
            ...prev,
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

        setSending(false)
    }

    return (
        <div className="app-shell flex">

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
                    </select>

                    {sending && (
                        <button
                            onClick={stopGeneration}
                            className="bg-red-600 px-3 py-2 rounded"
                        >
                            Stop
                        </button>
                    )}

                </div>

                <div className="flex-1 px-10 py-8 overflow-hidden">

                    <div className="max-w-3xl mx-auto h-full">

                        <Virtuoso
                            data={messages}
                            itemContent={(index, msg) => (
                                <ChatMessageBubble
                                    key={msg.id}
                                    message={msg}
                                    onEdit={editMessage}
                                    onRegenerate={regenerate}
                                />
                            )}
                        />

                    </div>

                </div>

                <div className="border-t border-[#214B42] bg-[#1A3F38] p-5 flex gap-3">

          <textarea
              className="flex-1 p-3 bg-[#214B42] text-[#F7E7CE] rounded-lg resize-none outline-none"
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

                    {sending ? (
                        <button
                            onClick={stopGeneration}
                            className="bg-red-500 px-5 py-2 rounded-lg"
                        >
                            Stop
                        </button>
                    ) : (
                        <button
                            onClick={() => sendMessage()}
                            className="bg-[#C9B08B] text-[#102C26] px-5 py-2 rounded-lg hover:opacity-90 transition"
                        >
                            Send
                        </button>
                    )}

                </div>

            </div>

        </div>
    )
}