"use client"

import {useRef} from "react"
import {Paperclip, X} from "lucide-react"

type Props = {
    input: string
    setInput: (v: string) => void
    model: string
    setModel: (v: string) => void
    files: File[]
    setFiles: (f: File[]) => void
    sending: boolean
    onSend: () => void
    onStop: () => void
}

export default function ChatInput({
                                      input,
                                      setInput,
                                      model,
                                      setModel,
                                      files,
                                      setFiles,
                                      sending,
                                      onSend,
                                      onStop
                                  }: Props) {
    const fileRef = useRef<HTMLInputElement>(null)

    function removeFile(index: number) {
        const updated = [...files]
        updated.splice(index, 1)
        setFiles(updated)
    }

    return (
        <div className="border-t border-[#214B42] bg-[#1A3F38] py-6">

            <div className="max-w-3xl mx-auto px-4">

                <div className="bg-[#214B42] rounded-2xl p-4">

                    {files.length > 0 && (
                        <div className="flex gap-3 mb-3 flex-wrap">

                            {files.map((file, i) => (

                                <div
                                    key={i}
                                    className="relative bg-[#1A3F38] rounded-lg p-2"
                                >

                                    {file.type.startsWith("image") ? (
                                        <img
                                            src={URL.createObjectURL(file)}
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="text-xs text-[#F7E7CE]">
                                            {file.name}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => removeFile(i)}
                                        className="absolute top-1 right-1"
                                    >
                                        <X size={14}/>
                                    </button>

                                </div>

                            ))}

                        </div>
                    )}

                    <div className="flex items-center gap-3">

                        <button
                            onClick={() => fileRef.current?.click()}
                            className="text-[#F7E7CE]"
                        >
                            <Paperclip size={18}/>
                        </button>

                        <input
                            ref={fileRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                if (!e.target.files) return
                                setFiles([...files, ...Array.from(e.target.files)])
                            }}
                        />

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            rows={1}
                            placeholder="Type your message..."
                            className="flex-1 bg-transparent resize-none outline-none text-[#F7E7CE]"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    onSend()
                                }
                            }}
                        />

                        {sending ? (
                            <button
                                onClick={onStop}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg"
                            >
                                Stop
                            </button>
                        ) : (
                            <button
                                onClick={onSend}
                                className="bg-[#C9B08B] text-[#102C26] px-4 py-2 rounded-lg"
                            >
                                ↑
                            </button>
                        )}

                    </div>

                    <div className="mt-3 text-sm text-[#EAD9B7]">

                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="bg-transparent outline-none"
                        >
                            <option value="gpt-5">GPT-5</option>
                            <option value="gpt-5-mini">GPT-5 mini</option>
                        </select>

                    </div>

                </div>

            </div>

        </div>
    )
}