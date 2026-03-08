"use client"

export default function FileModal({ file, onClose }: any) {

    if (!file) return null

    const isImage = file.type.startsWith("image")
    const isPdf = file.type === "application/pdf"

    return (

        <div
            onClick={onClose}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        >

            <div
                onClick={(e) => e.stopPropagation()}
                className="max-w-4xl max-h-[90vh]"
            >

                {isImage && (
                    <img
                        src={file.url}
                        className="max-h-[90vh] rounded-lg"
                    />
                )}

                {isPdf && (
                    <iframe
                        src={file.url}
                        className="w-[800px] h-[90vh] rounded-lg"
                    />
                )}

                {!isImage && !isPdf && (
                    <a
                        href={file.url}
                        target="_blank"
                        className="bg-white p-4 rounded"
                    >
                        Download file
                    </a>
                )}

            </div>

        </div>

    )
}