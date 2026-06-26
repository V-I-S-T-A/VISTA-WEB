export default function OCRResults() {
    return (
        <div>
            {/* Back button */}
            <div style={{ marginBottom: '16px' }}>
                <span className="font-inter text-gray-500" style={{ fontSize: '13px' }}>
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-1 font-inter font-semibold"
                        style={{
                            fontSize: '12px',
                            background: 'linear-gradient(#FFF4BA, #FFF4BA) padding-box, linear-gradient(#FFE452, #FFE452) border-box',
                            border: '3px solid transparent',
                            borderRadius: '99px',
                            padding: '4px 14px',
                            cursor: 'pointer',
                            marginRight: '8px',
                            color: '#142d55',
                            outline: 'none',
                            boxShadow: '0 0 0 3px #FFE452',
                            backgroundColor: '#FFF4BA',
                            boxSizing: 'border-box',
                        }}
                    >
                        &gt; Back
                    </button>
                    OCR Extraction results.
                </span>
            </div>

            {/* OCR Extraction Card — yellow/gold gradient matching reference image */}
            <div
                style={{
                    background: 'linear-gradient(135deg, #FDC849 0%, #FDC849 50%, #FDC849 100%)',
                    borderRadius: '12px',
                    padding: '18px 24px 14px',
                    marginBottom: '16px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <p
                            className="font-inter font-semibold"
                            style={{ fontSize: '11px', color: '#142d55', marginBottom: '2px' }}
                        >
                            System Health
                        </p>
                        <p
                            className="font-inter font-black uppercase"
                            style={{ fontSize: '22px', letterSpacing: '0.02em', color: '#ffffff' }}
                        >
                            OCR Extraction
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span
                            className="font-inter font-bold uppercase"
                            style={{
                                fontSize: '8px',
                                color: '#0B8380',
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                padding: '3px 10px',
                                borderRadius: '99px',
                                display: 'inline-block',
                                marginBottom: '4px',
                                letterSpacing: '0.06em',
                            }}
                        >
                            Active Engine
                        </span>
                        <p
                            className="font-inter font-black"
                            style={{ fontSize: '30px', lineHeight: 1, color: '#F59E0B' }}
                        >
                            100%
                        </p>
                    </div>
                </div>
                {/* Amber progress bar */}
                <div
                    style={{
                        marginTop: '8px',
                        height: '5px',
                        borderRadius: '99px',
                        backgroundColor: 'rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '99px',
                            backgroundColor: '#F59E0B',
                        }}
                    />
                </div>
            </div>

            {/* Extracted Structured Data Banner — blue matching reference */}
            <div
                style={{
                    background: '#1f5cae',
                    borderRadius: '10px',
                    padding: '14px 24px',
                    marginBottom: '20px',
                }}
            >
                <p
                    className="font-inter font-bold uppercase"
                    style={{ fontSize: '14px', letterSpacing: '0.04em', color: '#ffffff' }}
                >
                    Extracted Structured Data
                </p>
            </div>

            {/* Structured Data Fields */}
            <div
                style={{
                    border: '1.5px solid #e5e7eb',
                    borderRadius: '0px',
                    padding: '24px',
                    marginBottom: '28px',
                }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Submitter Name */}
                    <div>
                        <p
                            className="font-inter font-bold text-[#142d55] uppercase"
                            style={{ fontSize: '11px', letterSpacing: '0.04em', marginBottom: '6px' }}
                        >
                            Submitter Name
                        </p>
                        <div
                            style={{
                                border: '1.5px solid #d1d5db',
                                borderRadius: '8px',
                                padding: '9px 13px',
                                fontSize: '13px',
                                fontFamily: 'Inter, sans-serif',
                                color: '#9ca3af',
                                backgroundColor: '#fff',
                            }}
                        >
                            Select Institution
                        </div>
                    </div>

                    {/* Date of Submission */}
                    <div>
                        <p
                            className="font-inter font-bold text-[#142d55] uppercase"
                            style={{ fontSize: '11px', letterSpacing: '0.04em', marginBottom: '6px' }}
                        >
                            Date of Submission
                        </p>
                        <div
                            style={{
                                border: '1.5px solid #d1d5db',
                                borderRadius: '8px',
                                padding: '9px 13px',
                                fontSize: '13px',
                                fontFamily: 'Inter, sans-serif',
                                color: '#9ca3af',
                                backgroundColor: '#fff',
                            }}
                        >
                            Select Institution
                        </div>
                    </div>

                    {/* Document Type */}
                    <div>
                        <p
                            className="font-inter font-bold text-[#142d55] uppercase"
                            style={{ fontSize: '11px', letterSpacing: '0.04em', marginBottom: '6px' }}
                        >
                            Document Type
                        </p>
                        <div
                            style={{
                                border: '1.5px solid #d1d5db',
                                borderRadius: '8px',
                                padding: '9px 13px',
                                fontSize: '13px',
                                fontFamily: 'Inter, sans-serif',
                                color: '#9ca3af',
                                backgroundColor: '#fff',
                            }}
                        >
                            Select Institution
                        </div>
                    </div>

                    {/* Reference ID */}
                    <div>
                        <p
                            className="font-inter font-bold text-[#142d55] uppercase"
                            style={{ fontSize: '11px', letterSpacing: '0.04em', marginBottom: '6px' }}
                        >
                            Reference ID
                        </p>
                        <div
                            style={{
                                border: '1.5px solid #d1d5db',
                                borderRadius: '8px',
                                padding: '9px 13px',
                                fontSize: '13px',
                                fontFamily: 'Inter, sans-serif',
                                color: '#9ca3af',
                                backgroundColor: '#fff',
                            }}
                        >
                            Select Type
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons — right-aligned to table edge */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                    type="button"
                    className="font-inter font-bold uppercase tracking-wider transition hover:bg-[#e8b832] active:scale-95"
                    style={{
                        fontSize: '12px',
                        padding: '10px 22px',
                        backgroundColor: '#FDC849',
                        color: '#6E5C00',
                        border: '2px solid #6E5C00',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        letterSpacing: '0.06em',
                    }}
                >
                    Approve &amp; Save to Drive
                </button>
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="font-inter font-bold uppercase tracking-wider transition hover:bg-gray-100 active:scale-95"
                    style={{
                        fontSize: '12px',
                        padding: '10px 22px',
                        backgroundColor: '#fff',
                        color: '#142d55',
                        border: '2px solid #142d55',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        letterSpacing: '0.06em',
                    }}
                >
                    Redo
                </button>
            </div>
        </div>
    )
}
