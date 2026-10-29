import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import { cleanAndFormatChatGPTText } from '../utils/markdownUtils'
import { useTheme } from '../context/ThemeContext'
import { FiCopy, FiCheck } from 'react-icons/fi'
import { 
    PipelineFlowDiagram, 
    LogitsScoreChart, 
    ProbabilitiesChart, 
    MultiPositionTokensDiagram,
    FfnTransformerFlowDiagram 
} from './NoteDiagrams'

/**
 * Enhanced CodeBlock component with copy functionality
 */
function CodeBlock({ node, inline, className, children, ...props }) {
    const { theme } = useTheme()
    const dark = theme === 'dark'
    const [copied, setCopied] = useState(false)
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''
    const codeString = String(children).replace(/\n$/, '')

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(codeString)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy code: ', err)
        }
    }

    if (inline) {
        return (
            <code
                className={`px-2 py-0.5 mx-1 rounded font-mono text-xs border-0 border-none font-medium inline-block select-all ${
                    dark ? 'bg-[#1e1e24] text-zinc-100' : 'bg-slate-200/90 text-slate-800'
                }`}
                {...props}
            >
                {children}
            </code>
        )
    }

    return (
        <div className='relative my-5 rounded-xl overflow-hidden border border-zinc-800 bg-[#08080a]'>
            {/* Header bar */}
            <div className='flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 text-xs text-zinc-400 font-mono select-none'>
                <span className='font-semibold uppercase tracking-wider text-blue-400'>
                    {language || 'python'}
                </span>
                <button
                    type='button'
                    onClick={handleCopy}
                    className='flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-sans text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition cursor-pointer'
                    title='Copy code'
                >
                    {copied ? (
                        <>
                            <FiCheck className='text-emerald-400' />
                            <span className='text-emerald-400 font-medium'>Copied</span>
                        </>
                    ) : (
                        <>
                            <FiCopy />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code Body */}
            <pre className='p-4 overflow-x-auto text-sm font-mono leading-relaxed text-zinc-200 scrollbar-thin scrollbar-thumb-zinc-700'>
                <code className={className} {...props}>
                    {children}
                </code>
            </pre>
        </div>
    )
}

/**
 * Universal Markdown + LaTeX Math Renderer matching the user's exact dark aesthetic
 */
export default function MarkdownRenderer({ content, className = '' }) {
    const { theme } = useTheme()
    const dark = theme === 'dark'

    // Clean and normalize text
    const processedContent = cleanAndFormatChatGPTText(content || '')

    // Split markdown by custom interactive diagram markers
    const parts = processedContent.split(/(:::[a-z-]+:::)/g)

    const renderMarkdownChunk = (chunk, idx) => {
        if (!chunk) return null

        if (chunk === ':::pipeline-flow:::') {
            return <PipelineFlowDiagram key={`diag-pipe-${idx}`} />
        }
        if (chunk === ':::ffn-transformer-flow:::' || chunk === ':::ffn-flow:::') {
            return <FfnTransformerFlowDiagram key={`diag-ffn-${idx}`} />
        }
        if (chunk === ':::logits-chart:::') {
            return <LogitsScoreChart key={`diag-logits-${idx}`} />
        }
        if (chunk === ':::probabilities-chart:::') {
            return <ProbabilitiesChart key={`diag-probs-${idx}`} />
        }
        if (chunk === ':::multi-position-diagram:::') {
            return <MultiPositionTokensDiagram key={`diag-multi-${idx}`} />
        }

        return (
            <ReactMarkdown
                key={`md-${idx}`}
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
                components={{
                    code: CodeBlock,

                    h1: ({ children }) => (
                        <h1 className={`text-xl sm:text-2xl lg:text-[26px] font-bold tracking-tight mt-2 mb-4 leading-snug ${
                            dark ? 'text-white' : 'text-gray-900'
                        }`}>
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 leading-snug ${
                            dark ? 'text-white' : 'text-gray-900'
                        }`}>
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className={`text-base sm:text-lg font-bold mt-6 mb-3 leading-snug ${
                            dark ? 'text-white' : 'text-gray-900'
                        }`}>
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className={`text-sm sm:text-base font-bold mt-4 mb-2 ${
                            dark ? 'text-zinc-200' : 'text-gray-900'
                        }`}>
                            {children}
                        </h4>
                    ),

                    p: ({ children }) => (
                        <p className={`text-sm sm:text-base leading-relaxed my-3.5 font-normal ${
                            dark ? 'text-zinc-200' : 'text-gray-800'
                        }`}>
                            {children}
                        </p>
                    ),

                    ul: ({ children }) => (
                        <ul className={`list-disc pl-6 space-y-1.5 my-3 text-sm sm:text-base ${
                            dark ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className={`list-decimal pl-6 space-y-1.5 my-3 text-sm sm:text-base ${
                            dark ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className='leading-relaxed pl-1 my-1'>
                            {children}
                        </li>
                    ),

                    blockquote: ({ children }) => (
                        <blockquote className={`my-4 pl-4 py-2 border-l-4 rounded-r-xl text-sm sm:text-base ${
                            dark 
                                ? 'border-blue-500 bg-blue-950/20 text-zinc-200' 
                                : 'border-blue-600 bg-blue-50/80 text-blue-900'
                        }`}>
                            {children}
                        </blockquote>
                    ),

                    table: ({ children }) => (
                        <div className={`overflow-x-auto my-6 rounded-xl border ${
                            dark ? 'border-zinc-800 bg-[#070709]' : 'border-gray-200 bg-white'
                        }`}>
                            <table className='min-w-full text-left text-sm border-collapse'>
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className={`border-b ${
                            dark ? 'bg-zinc-900 text-zinc-100 border-zinc-800' : 'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                            {children}
                        </thead>
                    ),
                    th: ({ children }) => (
                        <th className='px-4 py-3 font-bold text-xs uppercase tracking-wider'>
                            {children}
                        </th>
                    ),
                    tbody: ({ children }) => (
                        <tbody className={`divide-y ${
                            dark ? 'divide-zinc-800/80' : 'divide-gray-100'
                        }`}>
                            {children}
                        </tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className={`transition-colors ${
                            dark ? 'hover:bg-zinc-900/60' : 'hover:bg-blue-50/50'
                        }`}>
                            {children}
                        </tr>
                    ),
                    td: ({ children }) => (
                        <td className={`px-4 py-3 text-sm ${
                            dark ? 'text-zinc-200' : 'text-gray-700'
                        }`}>
                            {children}
                        </td>
                    ),

                    hr: () => (
                        <hr className={`my-8 border-t ${
                            dark ? 'border-zinc-800' : 'border-gray-200'
                        }`} />
                    ),

                    strong: ({ children }) => (
                        <strong className={`font-bold ${
                            dark ? 'text-white' : 'text-gray-900'
                        }`}>
                            {children}
                        </strong>
                    ),

                    img: ({ src, alt, ...props }) => {
                        const handleImgError = (e) => {
                            const currentSrc = e.target.src || ''
                            if (currentSrc.includes('127.0.0.1:8000')) {
                                e.target.src = currentSrc.replace('127.0.0.1:8000', 'localhost:8000')
                            } else if (currentSrc.includes('localhost:8000')) {
                                e.target.src = currentSrc.replace('localhost:8000', '127.0.0.1:8000')
                            }
                        }

                        // Determine if resource is a video (Cloudinary video URL, video extensions, or explicit video caption prefix)
                        const isVideo = Boolean(
                            src && (
                                src.includes('/video/upload/') ||
                                /\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/i.test(src) ||
                                (alt && (alt.toLowerCase().startsWith('video:') || alt.toLowerCase() === 'video'))
                            )
                        )

                        if (isVideo) {
                            const cleanCaption = (alt || '').replace(/^video:\s*/i, '').trim()
                            return (
                                <figure className='my-6 flex flex-col items-center justify-center w-full'>
                                    <div className={`w-full overflow-hidden rounded-2xl border transition-all duration-300 relative ${
                                        dark 
                                            ? 'border-zinc-800 bg-[#060608] shadow-[0_14px_36px_rgba(0,0,0,0.75)]' 
                                            : 'border-gray-200 bg-gray-900 shadow-xl'
                                    }`}>
                                        <video
                                            src={src}
                                            controls
                                            playsInline
                                            preload='metadata'
                                            className='w-full max-h-[560px] object-contain rounded-2xl mx-auto block'
                                        >
                                            Your browser does not support HTML5 video playback.
                                        </video>
                                    </div>
                                    {cleanCaption && cleanCaption !== 'video' && cleanCaption !== 'Note Video' && (
                                        <figcaption className={`text-xs mt-2.5 flex items-center gap-1.5 font-medium italic ${
                                            dark ? 'text-zinc-400' : 'text-gray-600'
                                        }`}>
                                            <span className='not-italic font-bold text-blue-400 uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20'>
                                                Video
                                            </span>
                                            <span>{cleanCaption}</span>
                                        </figcaption>
                                    )}
                                </figure>
                            )
                        }

                        return (
                            <figure className='my-6 flex flex-col items-center justify-center w-full'>
                                <div className={`overflow-hidden rounded-2xl border transition-all ${
                                    dark ? 'border-zinc-800 bg-zinc-950/60 shadow-[0_10px_30px_rgba(0,0,0,0.6)]' : 'border-gray-200 bg-gray-50 shadow-md'
                                }`}>
                                    <img
                                        src={src}
                                        alt={alt || 'Note Image'}
                                        onError={handleImgError}
                                        className='max-h-[550px] w-auto max-w-full object-contain mx-auto block'
                                        loading='lazy'
                                        {...props}
                                    />
                                </div>
                                {alt && alt !== 'image' && alt !== 'Note Image' && (
                                    <figcaption className={`text-xs mt-2.5 text-center italic ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>
                                        {alt}
                                    </figcaption>
                                )}
                            </figure>
                        )
                    }
                }}
            >
                {chunk}
            </ReactMarkdown>
        )
    }

    return (
        <div className={`prose-container w-full overflow-hidden leading-relaxed ${dark ? 'dark dark-math' : 'light light-math'} ${className}`}>
            {parts.map((chunk, idx) => renderMarkdownChunk(chunk, idx))}
        </div>
    )
}
