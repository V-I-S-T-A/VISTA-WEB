export default function AuditLogHistory() {
    return (
        <>
            {/* Page heading — mirrors UserManagementHeader */}
            <div className="flex items-start justify-between w-full" style={{ marginBottom: '14px' }}>
                <div>
                    <h2 className="font-inter font-bold text-[#142d55]" style={{ fontSize: '26px', lineHeight: 1.15 }}>
                        Audit Log History
                    </h2>
                    <p className="font-inter text-gray-500 mt-0.5" style={{ fontSize: '13px' }}>
                        System-wide transparency of activities.
                    </p>
                </div>
            </div>

            {/* Table shell */}
            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white mx-4 sm:mx-6 lg:mx-8 my-4">

                {/* Blue section header */}
                <div className="bg-[#1f5cae] h-16 flex items-center" style={{ paddingLeft: '30px' }}>
                    <h3 className="font-inter text-[18px] font-bold text-white">Audit Logs</h3>
                </div>

                {/* Empty state body */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '420px',
                        padding: '40px 24px',
                        textAlign: 'center',
                        background: '#fff',
                    }}
                >
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: '#dfe7fb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px',
                        }}
                    >
                        <svg
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1f5cae"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                            <line x1="9" y1="12" x2="15" y2="12" />
                            <line x1="9" y1="16" x2="13" y2="16" />
                        </svg>
                    </div>

                    <h3
                        className="font-inter font-bold text-[#142d55]"
                        style={{ fontSize: '18px', marginBottom: '8px' }}
                    >
                        No audit logs yet
                    </h3>

                    <p
                        className="font-inter text-gray-500"
                        style={{ fontSize: '13px', maxWidth: '360px', lineHeight: 1.6 }}
                    >
                        System actions such as user account changes, document submissions,
                        and access updates will appear here once they occur.
                    </p>

                    <div
                        style={{
                            marginTop: '28px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#eef1f7',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            padding: '8px 16px',
                        }}
                    >
                        <span
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#9ca3af',
                                display: 'inline-block',
                                flexShrink: 0,
                            }}
                        />
                        <span className="font-inter font-medium text-gray-500" style={{ fontSize: '12px' }}>
                            Logs are recorded automatically — no setup required.
                        </span>
                    </div>
                </div>

            </section>
        </>
    )
}