"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {

    const supabase = createClient()

    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    async function signIn() {

        setLoading(true)

        const redirectTo = `${window.location.origin}/auth/callback`

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: redirectTo
            }
        })

        if (error) {
            alert(error.message)
            setLoading(false)
            return
        }

        setLoading(false)

        alert("Check your email for the login link.")
    }

    return (

        <div className="flex items-center justify-center h-screen">

            <div className="flex flex-col gap-4 w-80">

                <h1 className="text-2xl font-bold">
                    Sign in
                </h1>

                <input
                    className="p-2 rounded bg-zinc-800"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button
                    onClick={signIn}
                    disabled={loading}
                    className="bg-blue-600 p-2 rounded"
                >
                    Sign in
                </button>

            </div>

        </div>

    )
}