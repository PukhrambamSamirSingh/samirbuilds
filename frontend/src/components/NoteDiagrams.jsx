import React from 'react'
import { FiCheckCircle } from 'react-icons/fi'

/**
 * PipelineFlowDiagram
 * Exact recreation of "The entire idea in one picture" from Image 1
 */
export function PipelineFlowDiagram() {
    return (
        <div className='my-8 flex flex-col items-center w-full'>
            <div className='w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#050507] p-6 sm:p-8 flex flex-col items-center gap-3.5'>
                {/* 1. Input Context */}
                <div className='text-center'>
                    <div className='text-sm font-bold text-white tracking-wide'>
                        Input context
                    </div>
                    <div className='text-xs text-zinc-400 mt-0.5'>
                        The weather is cold
                    </div>
                </div>

                {/* Arrow */}
                <div className='text-zinc-500 font-bold text-sm select-none'>↓</div>

                {/* 2. Transformer */}
                <div className='w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-3.5 text-center flex flex-col items-center gap-1 hover:border-zinc-700 transition'>
                    <div className='text-sm font-bold text-white'>
                        Transformer
                    </div>
                    <div className='text-xs text-zinc-400'>
                        Builds contextual representations
                    </div>
                    <div className='text-sm text-zinc-100 font-serif tracking-wider mt-1'>
                        <span className='font-bold'>h</span> = [0.8, 0.2, 0.5]
                    </div>
                </div>

                {/* Arrow */}
                <div className='text-zinc-500 font-bold text-sm select-none'>↓</div>

                {/* 3. Language Model Head (Highlighted Blue Card) */}
                <div className='w-full rounded-xl border-2 border-blue-500/90 bg-[#09152b]/50 px-5 py-4 text-center flex flex-col items-center gap-1.5'>
                    <div className='text-sm font-bold text-white tracking-wide'>
                        Language Model Head
                    </div>
                    <div className='text-sm text-white font-serif tracking-wider font-semibold'>
                        <span className='font-bold'>z</span> = <span className='font-bold'>h</span>W<sub>vocab</sub>
                    </div>
                    <div className='text-xs text-zinc-300'>
                        Calculates a score for every vocabulary token
                    </div>
                    <div className='text-xs sm:text-sm text-zinc-200 font-serif tracking-wider mt-0.5'>
                        [1.3, 0.5, 0.7, 0.1, −0.25]
                    </div>
                </div>

                {/* Arrow */}
                <div className='text-zinc-500 font-bold text-sm select-none'>↓</div>

                {/* 4. Softmax */}
                <div className='w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-3.5 text-center flex flex-col items-center gap-1 hover:border-zinc-700 transition'>
                    <div className='text-sm font-bold text-white'>
                        Softmax
                    </div>
                    <div className='text-xs text-zinc-400'>
                        Turns scores into probabilities
                    </div>
                    <div className='text-xs sm:text-sm text-zinc-100 font-serif tracking-wider mt-1'>
                        [39.8%, 17.9%, 21.9%, 12.0%, 8.5%]
                    </div>
                </div>

                {/* Arrow */}
                <div className='text-zinc-500 font-bold text-sm select-none'>↓</div>

                {/* 5. Choose Next Token (Highlighted Green Card) */}
                <div className='w-full rounded-xl border-2 border-emerald-500/90 bg-[#062016]/50 px-5 py-4 text-center flex flex-col items-center gap-1.5 shadow-[0_0_25px_rgba(16,185,129,0.18)]'>
                    <FiCheckCircle className='text-emerald-400 text-lg' />
                    <div className='text-sm font-bold text-white tracking-wide'>
                        Choose the next token
                    </div>
                    <div className='text-xs text-zinc-300'>
                        For greedy decoding, choose{' '}
                        <code className='px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-100 font-mono text-[11px] border border-zinc-700/80'>
                            today
                        </code>{' '}
                        in this example.
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * LogitsScoreChart
 * Interactive visual representation for "Explore the logits"
 */
export function LogitsScoreChart() {
    const logits = [
        { token: 'today', score: 1.30, width: '90%', highlight: true },
        { token: 'outside', score: 0.50, width: '42%', highlight: false },
        { token: 'because', score: 0.70, width: '56%', highlight: false },
        { token: 'warm', score: 0.10, width: '15%', highlight: false },
        { token: '.', score: -0.25, width: '20%', isNegative: true, highlight: false },
    ]

    return (
        <div className='my-6 rounded-2xl border border-zinc-800 bg-[#050507] p-5 sm:p-6 w-full'>
            <div className='flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/80'>
                <div>
                    <h4 className='text-sm font-bold text-white'>Explore the Logits</h4>
                    <p className='text-xs text-zinc-400'>Raw scores produced by the head before softmax</p>
                </div>
                <span className='text-[10px] uppercase tracking-wider font-mono text-zinc-500'>Score (z)</span>
            </div>

            <div className='flex flex-col gap-2.5'>
                {logits.map(item => (
                    <div key={item.token} className='flex items-center gap-3'>
                        <span className='w-16 text-xs font-mono font-semibold text-zinc-200 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-center'>
                            {item.token}
                        </span>
                        <div className='flex-1 h-6 bg-zinc-900 rounded-lg overflow-hidden relative flex items-center px-2'>
                            <div
                                className={`h-full rounded transition-all duration-500 ${
                                    item.isNegative 
                                        ? 'bg-rose-500/70' 
                                        : item.highlight ? 'bg-gradient-to-r from-blue-600 to-indigo-500' : 'bg-zinc-700'
                                }`}
                                style={{ width: item.width }}
                            />
                        </div>
                        <span className={`w-14 text-right text-xs font-mono font-bold ${
                            item.highlight ? 'text-blue-400' : item.isNegative ? 'text-rose-400' : 'text-zinc-300'
                        }`}>
                            {item.score > 0 ? `+${item.score.toFixed(2)}` : item.score.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * ProbabilitiesChart
 * Interactive visual representation for "Final next-token probabilities"
 */
export function ProbabilitiesChart() {
    const probs = [
        { token: 'today', pct: 39.8, width: '39.8%', highlight: true },
        { token: 'outside', pct: 17.9, width: '17.9%', highlight: false },
        { token: 'because', pct: 21.9, width: '21.9%', highlight: false },
        { token: 'warm', pct: 12.0, width: '12.0%', highlight: false },
        { token: '.', pct: 8.5, width: '8.5%', highlight: false },
    ]

    return (
        <div className='my-6 rounded-2xl border border-zinc-800 bg-[#050507] p-5 sm:p-6 w-full'>
            <div className='flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/80'>
                <div>
                    <h4 className='text-sm font-bold text-white'>Final Next-Token Probabilities</h4>
                    <p className='text-xs text-zinc-400'>Softmax normalized distribution (Sums to 100%)</p>
                </div>
                <span className='text-[10px] uppercase tracking-wider font-mono text-emerald-400 font-semibold'>Probability P(i)</span>
            </div>

            <div className='flex flex-col gap-2.5'>
                {probs.map(item => (
                    <div key={item.token} className='flex items-center gap-3'>
                        <span className='w-16 text-xs font-mono font-semibold text-zinc-200 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-center'>
                            {item.token}
                        </span>
                        <div className='flex-1 h-6 bg-zinc-900 rounded-lg overflow-hidden relative flex items-center px-2'>
                            <div
                                className={`h-full rounded transition-all duration-500 ${
                                    item.highlight ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-zinc-600'
                                }`}
                                style={{ width: item.width }}
                            />
                        </div>
                        <span className={`w-14 text-right text-xs font-mono font-bold ${
                            item.highlight ? 'text-emerald-400' : 'text-zinc-300'
                        }`}>
                            {item.pct.toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * MultiPositionTokensDiagram
 * Recreation for "One vector per position"
 */
export function MultiPositionTokensDiagram() {
    const tokens = [
        { word: 'The', vector: 'h₁' },
        { word: 'weather', vector: 'h₂' },
        { word: 'is', vector: 'h₃' },
        { word: 'cold', vector: 'h₄', active: true },
    ]

    return (
        <div className='my-7 rounded-2xl border border-zinc-800 bg-[#050507] p-6 w-full flex flex-col items-center gap-4'>
            <div className='text-center'>
                <div className='text-sm font-bold text-white'>One Vector Per Position</div>
                <div className='text-xs text-zinc-400'>Causal Transformer outputs contextual hidden states for each token</div>
            </div>

            {/* Token cards row */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl'>
                {tokens.map(t => (
                    <div
                        key={t.word}
                        className={`rounded-xl p-3 text-center border transition-all ${
                            t.active 
                                ? 'bg-blue-950/40 border-blue-500' 
                                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                        }`}
                    >
                        <div className='text-xs font-mono font-bold text-white'>
                            "{t.word}"
                        </div>
                        <div className='text-sm font-serif font-bold text-blue-400 mt-1'>
                            <span className='font-sans'>h</span><sub>{t.vector.slice(1)}</sub>
                        </div>
                    </div>
                ))}
            </div>

            <div className='text-zinc-500 font-bold text-sm select-none'>↓</div>

            {/* Shared Head Bar */}
            <div className='w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5 text-center'>
                <div className='text-xs font-bold text-white tracking-wide'>
                    Shared Language Model Head
                </div>
                <div className='text-sm font-serif font-semibold text-zinc-200 mt-0.5'>
                    Z = HW<sub>vocab</sub>
                </div>
                <div className='text-[11px] text-zinc-400 mt-0.5'>
                    The same weight matrix is applied across all positions in parallel.
                </div>
            </div>
        </div>
    )
}

/**
 * FfnTransformerFlowDiagram
 * Pixel-perfect recreation of "Where FFN fits in a Transformer" diagram
 */
export function FfnTransformerFlowDiagram({ title, caption, steps }) {
    const defaultSteps = [
        {
            title: 'Token representations',
            subtitle: 'Input vectors',
            variant: 'default'
        },
        {
            title: 'Self-attention',
            subtitle: 'Mixes information between tokens',
            variant: 'blue'
        },
        {
            title: 'FFN',
            subtitle: "Transforms each token's features",
            variant: 'green'
        },
        {
            title: 'Updated representations',
            subtitle: 'Ready for the next layer',
            variant: 'default'
        }
    ]

    const cardSteps = Array.isArray(steps) && steps.length > 0 ? steps : defaultSteps
    const diagramTitle = title || 'Where FFN fits in a Transformer'
    const diagramCaption = caption || 'Simplified view; real Transformer blocks also include residual connections and normalization.'

    const getCardStyles = (variant) => {
        switch (variant) {
            case 'blue':
                return 'border-2 border-blue-500 bg-[#0c0c0e] shadow-[0_0_20px_rgba(59,130,246,0.18)]'
            case 'green':
            case 'emerald':
                return 'border-2 border-emerald-500 bg-[#0c0c0e] shadow-[0_0_20px_rgba(16,185,129,0.18)]'
            case 'purple':
                return 'border-2 border-purple-500 bg-[#0c0c0e] shadow-[0_0_20px_rgba(168,85,247,0.18)]'
            case 'amber':
                return 'border-2 border-amber-500 bg-[#0c0c0e] shadow-[0_0_20px_rgba(245,158,11,0.18)]'
            default:
                return 'border border-zinc-800 bg-[#0c0c0e] hover:border-zinc-700'
        }
    }

    return (
        <div className='my-8 w-full flex justify-center'>
            <div className='w-full max-w-2xl rounded-2xl border-2 border-emerald-500/80 bg-[#000000] p-6 sm:p-8 flex flex-col gap-6 shadow-[0_0_35px_rgba(16,185,129,0.10)]'>
                {/* Title */}
                <h3 className='text-base sm:text-lg font-bold text-white tracking-wide m-0 text-left'>
                    {diagramTitle}
                </h3>

                {/* Vertical Flow of Cards */}
                <div className='flex flex-col items-center gap-3 w-full max-w-lg mx-auto'>
                    {cardSteps.map((step, idx) => (
                        <React.Fragment key={idx}>
                            <div className={`w-full rounded-xl px-6 py-4 text-center transition-all ${getCardStyles(step.variant)}`}>
                                <div className='text-sm sm:text-base font-bold text-white tracking-wide'>
                                    {step.title}
                                </div>
                                {step.subtitle && (
                                    <div className='text-xs text-zinc-300 mt-1 leading-relaxed'>
                                        {step.subtitle}
                                    </div>
                                )}
                            </div>

                            {idx < cardSteps.length - 1 && (
                                <div className='text-zinc-400 font-bold text-base select-none my-0.5'>
                                    ↓
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Caption at bottom */}
                {diagramCaption && (
                    <div className='text-xs text-zinc-400 border-t border-zinc-900 pt-4 mt-2 text-left leading-relaxed'>
                        {diagramCaption}
                    </div>
                )}
            </div>
        </div>
    )
}
