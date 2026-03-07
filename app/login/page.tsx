"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function LoginPage() {

    const supabase = createClient()
    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    async function login() {

        setLoading(true)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            alert(error.message)
            setLoading(false)
            return
        }

        router.push("/")
    }

    async function signup() {

        setLoading(true)

        const { error } = await supabase.auth.signUp({
            email,
            password
        })

        if (error) {
            alert(error.message)
            setLoading(false)
            return
        }

        router.push("/")
    }

    return (

        <div className="flex items-center justify-center h-screen">

            <div className="flex flex-col gap-4 w-80">

                <h1 className="text-2xl font-bold">
                    Login
                </h1>

                <input
                    className="p-2 rounded bg-zinc-800"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    className="p-2 rounded bg-zinc-800"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={login}
                    disabled={loading}
                    className="bg-blue-600 p-2 rounded"
                >
                    Login
                </button>

                <button
                    onClick={signup}
                    disabled={loading}
                    className="bg-zinc-700 p-2 rounded"
                >
                    Create Account
                </button>

            </div>

        </div>
    )
}