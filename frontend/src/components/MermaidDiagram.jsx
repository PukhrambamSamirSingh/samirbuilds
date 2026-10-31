import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { useTheme } from '../context/ThemeContext'
import { FiAlertCircle } from 'react-icons/fi'

/**
 * Detect diagram type from Mermaid code
 */
function detectDiagramType(rawCode = '') {
    const firstLine = (rawCode || '')
        .trim()
        .split('\n')
        .map(l => l.trim())
        .find(l => l.length > 0 && !l.startsWith('%%')) || ''
    const lower = firstLine.toLowerCase()

    if (lower.startsWith('flowchart') || lower.startsWith('graph')) return 'Flowchart'
    if (lower.startsWith('sequencediagram')) return 'Sequence'
    if (lower.startsWith('classdiagram')) return 'Class'
    if (lower.startsWith('statediagram')) return 'State'
    if (lower.startsWith('erdiagram')) return 'Entity Relationship'
    if (lower.startsWith('gantt')) return 'Gantt'
    if (lower.startsWith('pie')) return 'Pie Chart'
    if (lower.startsWith('gitgraph')) return 'Git Graph'
    if (lower.startsWith('mindmap')) return 'Mindmap'
    if (lower.startsWith('timeline')) return 'Timeline'
    return 'Diagram'
}

/**
 * MermaidDiagram Component
 * Renders visual diagrams with blue/green styling on boxes matching user's aesthetic,
 * fully supports subgraphs (nested, directional, and styled), clean responsive container,
 * and graceful auto-repair for unclosed subgraph blocks.
 */
export default function MermaidDiagram({ code = '' }) {
    const { theme } = useTheme()
    const dark = theme === 'dark'
    const [svg, setSvg] = useState('')
    const [error, setError] = useState(null)
    const containerRef = useRef(null)

    // Defensive check: if no code or no diagram nodes/connections, do not render any container
    const trimmedCode = (code || '').trim()
    const contentLines = trimmedCode
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0 && !l.startsWith('%%'))

    const hasDiagramContent = contentLines.length >= 2 || (
        contentLines.length === 1 && /(-->|---|-.->|==>|->>|\[|\(|\{|\:)/.test(contentLines[0])
    )

    if (!trimmedCode || !hasDiagramContent) {
        return null
    }

    const diagramType = detectDiagramType(code)

    useEffect(() => {
        let isMounted = true
        const renderId = 'mermaid_' + Math.random().toString(36).slice(2, 9) + '_' + Date.now()

        const cleanupMermaidArtifacts = (id) => {
            const el = document.getElementById(id)
            if (el) el.remove()
            const dEl = document.getElementById('d' + id)
            if (dEl) dEl.remove()
        }

        const renderDiagram = async () => {
            if (!code || !code.trim()) {
                if (isMounted) {
                    setSvg('')
                    setError(null)
                }
                return
            }

            try {
                // Strip outer markdown fences if inadvertently passed
                let cleanCode = code.trim()
                if (cleanCode.startsWith('```mermaid')) {
                    cleanCode = cleanCode.replace(/^```mermaid\s*/i, '').replace(/```\s*$/, '').trim()
                } else if (cleanCode.startsWith('```')) {
                    cleanCode = cleanCode.replace(/^```[a-zA-Z0-9_-]*\s*/, '').replace(/```\s*$/, '').trim()
                }

                // Auto-repair any unclosed subgraphs if user missed `end`
                const codeLines = cleanCode.split(/\r?\n/)
                let openSubgraphs = 0
                for (const l of codeLines) {
                    const t = l.trim()
                    if (/^subgraph\b/i.test(t)) openSubgraphs++
                    else if (/^end\b/i.test(t)) openSubgraphs = Math.max(0, openSubgraphs - 1)
                }
                while (openSubgraphs > 0) {
                    cleanCode += '\nend'
                    openSubgraphs--
                }

                const blueColor = '#3b82f6'
                const emeraldColor = '#10b981'
                const cyanColor = '#06b6d4'
                const cardBg = dark ? '#0c0d12' : '#ffffff'

                const hasCustomStyles = /\b(?:style|classDef)\s+[a-zA-Z0-9_]/i.test(cleanCode)

                // Scoped CSS injected directly into the Mermaid SVG
                const themeCSS = dark ? `
                    .node rect, .node polygon, .node circle, .node ellipse, .node path.label-container {
                        ${hasCustomStyles ? '' : `fill: ${cardBg} !important;`}
                        stroke-width: 1.5px !important;
                        rx: 12px !important;
                        ry: 12px !important;
                    }
                    ${hasCustomStyles ? '' : `
                    .node:nth-of-type(3n+1) rect, .node:nth-of-type(3n+1) polygon, .node:nth-of-type(3n+1) circle, .node:nth-of-type(3n+1) path.label-container {
                        stroke: ${blueColor} !important;
                        filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.22));
                    }
                    .node:nth-of-type(3n+2) rect, .node:nth-of-type(3n+2) polygon, .node:nth-of-type(3n+2) circle, .node:nth-of-type(3n+2) path.label-container {
                        stroke: ${emeraldColor} !important;
                        filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.22));
                    }
                    .node:nth-of-type(3n) rect, .node:nth-of-type(3n) polygon, .node:nth-of-type(3n) circle, .node:nth-of-type(3n) path.label-container {
                        stroke: ${cyanColor} !important;
                        filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.22));
                    }
                    `}
                    .cluster rect {
                        rx: 16px !important;
                        ry: 16px !important;
                        stroke-width: 1.5px !important;
                    }
                    .cluster .label text, .cluster .nodeLabel {
                        fill: #93c5fd !important;
                        color: #93c5fd !important;
                        font-weight: 700 !important;
                        font-size: 13px !important;
                        letter-spacing: 0.04em !important;
                    }
                    .node .label, .nodeLabel {
                        color: #ffffff !important;
                        fill: #ffffff !important;
                        font-weight: 600 !important;
                    }
                    .edgePath .path {
                        stroke: #60a5fa !important;
                        stroke-width: 1.5px !important;
                    }
                    .edgePath marker path, marker path {
                        fill: #60a5fa !important;
                        stroke: #60a5fa !important;
                    }
                    .edgeLabel rect {
                        fill: #090d16 !important;
                        stroke: #1e293b !important;
                        rx: 6px !important;
                        ry: 6px !important;
                    }
                    .edgeLabel span {
                        color: #93c5fd !important;
                        font-weight: 500 !important;
                        font-size: 11px !important;
                    }
                ` : `
                    .node rect, .node polygon, .node circle, .node ellipse, .node path.label-container {
                        ${hasCustomStyles ? '' : `fill: ${cardBg} !important;`}
                        stroke-width: 1.5px !important;
                        rx: 12px !important;
                        ry: 12px !important;
                    }
                    ${hasCustomStyles ? '' : `
                    .node:nth-of-type(3n+1) rect, .node:nth-of-type(3n+1) polygon, .node:nth-of-type(3n+1) circle, .node:nth-of-type(3n+1) path.label-container {
                        stroke: #2563eb !important;
                    }
                    .node:nth-of-type(3n+2) rect, .node:nth-of-type(3n+2) polygon, .node:nth-of-type(3n+2) circle, .node:nth-of-type(3n+2) path.label-container {
                        stroke: #059669 !important;
                    }
                    .node:nth-of-type(3n) rect, .node:nth-of-type(3n) polygon, .node:nth-of-type(3n) circle, .node:nth-of-type(3n) path.label-container {
                        stroke: #0891b2 !important;
                    }
                    `}
                    .cluster rect {
                        rx: 16px !important;
                        ry: 16px !important;
                        stroke-width: 1.5px !important;
                    }
                    .cluster .label text, .cluster .nodeLabel {
                        fill: #1e40af !important;
                        color: #1e40af !important;
                        font-weight: 700 !important;
                        font-size: 13px !important;
                        letter-spacing: 0.04em !important;
                    }
                    .node .label, .nodeLabel {
                        color: #0f172a !important;
                        fill: #0f172a !important;
                        font-weight: 600 !important;
                    }
                    .edgePath .path {
                        stroke: #2563eb !important;
                        stroke-width: 1.5px !important;
                    }
                    .edgePath marker path, marker path {
                        fill: #2563eb !important;
                        stroke: #2563eb !important;
                    }
                    .edgeLabel rect {
                        fill: #f8fafc !important;
                        stroke: #cbd5e1 !important;
                        rx: 6px !important;
                        ry: 6px !important;
                    }
                    .edgeLabel span {
                        color: #1e40af !important;
                        font-weight: 500 !important;
                        font-size: 11px !important;
                    }
                `

                // Initialize mermaid with custom theme variables, themeCSS, and loose HTML label parsing
                mermaid.initialize({
                    startOnLoad: false,
                    theme: dark ? 'dark' : 'default',
                    securityLevel: 'loose',
                    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    logLevel: 'error',
                    suppressErrorRendering: true,
                    htmlLabels: true,
                    flowchart: {
                        htmlLabels: true,
                        useMaxWidth: true,
                        curve: 'basis'
                    },
                    themeCSS,
                    themeVariables: dark ? {
                        darkMode: true,
                        background: 'transparent',
                        mainBkg: '#0c0d12',
                        nodeBorder: '#3b82f6',
                        primaryColor: '#0c0d12',
                        primaryBorderColor: '#3b82f6',
                        primaryTextColor: '#ffffff',
                        secondaryColor: '#0c0d12',
                        secondaryBorderColor: '#10b981',
                        secondaryTextColor: '#ffffff',
                        tertiaryColor: '#0c0d12',
                        tertiaryBorderColor: '#06b6d4',
                        tertiaryTextColor: '#ffffff',
                        lineColor: '#60a5fa',
                        textColor: '#ffffff',
                        nodeTextColor: '#ffffff',
                        edgeLabelBackground: '#090d16',
                        fontSize: '13px'
                    } : {
                        background: 'transparent',
                        mainBkg: '#ffffff',
                        nodeBorder: '#2563eb',
                        primaryColor: '#ffffff',
                        primaryBorderColor: '#2563eb',
                        primaryTextColor: '#0f172a',
                        secondaryColor: '#ffffff',
                        secondaryBorderColor: '#059669',
                        secondaryTextColor: '#0f172a',
                        tertiaryColor: '#ffffff',
                        tertiaryBorderColor: '#0891b2',
                        tertiaryTextColor: '#0f172a',
                        lineColor: '#2563eb',
                        textColor: '#0f172a',
                        nodeTextColor: '#0f172a',
                        edgeLabelBackground: '#f8fafc',
                        fontSize: '13px'
                    }
                })

                // Render diagram to SVG
                const { svg: renderedSvg, bindFunctions } = await mermaid.render(renderId, cleanCode)

                if (isMounted) {
                    setSvg(renderedSvg)
                    setError(null)
                    if (typeof bindFunctions === 'function' && containerRef.current) {
                        setTimeout(() => {
                            if (isMounted && containerRef.current) {
                                bindFunctions(containerRef.current)
                            }
                        }, 50)
                    }
                }
            } catch (err) {
                console.warn('Mermaid rendering error:', err)
                if (isMounted) {
                    setError(err?.message || 'Invalid Mermaid syntax')
                    setSvg('')
                }
            } finally {
                cleanupMermaidArtifacts(renderId)
            }
        }

        renderDiagram()

        return () => {
            isMounted = false
            cleanupMermaidArtifacts(renderId)
        }
    }, [code, dark])

    // If an error occurred, render user-friendly alert box with source inspection
    if (error) {
        return (
            <div className={`my-6 rounded-2xl border overflow-hidden p-5 transition-all ${
                dark ? 'border-amber-500/30 bg-[#0c0906] text-amber-200' : 'border-amber-300 bg-amber-50 text-amber-900'
            }`}>
                <div className='flex items-center gap-2 text-xs font-bold tracking-wide uppercase pb-2 border-b border-amber-500/20'>
                    <FiAlertCircle className='text-amber-400 text-base' />
                    <span>Mermaid Syntax Error ({diagramType})</span>
                </div>
                <div className='mt-3 text-xs font-mono opacity-80 whitespace-pre-wrap break-all leading-relaxed'>
                    {error}
                </div>
                <pre className='mt-3 p-3.5 rounded-xl bg-black/60 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed'>
                    {code}
                </pre>
            </div>
        )
    }

    return (
        <div className={`mermaid-diagram-wrapper my-8 rounded-2xl border overflow-hidden transition-all duration-300 ${
            dark 
                ? 'border-zinc-800/90 bg-[#050507] shadow-[0_0_35px_rgba(37,99,235,0.07)]' 
                : 'border-gray-200 bg-white shadow-md'
        }`}>
            {/* Rendered SVG Viewport with Scoped Blue-Green Box Styling & Subgraph Support */}
            <div className='p-6 sm:p-8 overflow-x-auto flex justify-center items-center'>
                {svg ? (
                    <div
                        ref={containerRef}
                        className='mermaid-svg-viewport w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:mx-auto transition-all'
                        dangerouslySetInnerHTML={{ __html: svg }}
                    />
                ) : (
                    <div className='py-8 text-center text-xs text-zinc-500 font-mono'>
                        Rendering diagram...
                    </div>
                )}
            </div>
        </div>
    )
}
