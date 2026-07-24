import { useEffect, useRef, useState } from 'react'
import { X, Building2 } from 'lucide-react'

const FIELD_STYLES = {
    label: {
        display: 'block',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '5px',
    },
    input: {
        width: '100%',
        border: '1.5px solid #d1d5db',
        borderRadius: '8px',
        padding: '9px 13px',
        fontSize: '13px',
        fontFamily: 'Inter, sans-serif',
        color: '#111827',
        backgroundColor: '#fff',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s',
    },
    inputFocus: {
        borderColor: '#1f5cae',
    },
    error: {
        fontSize: '11px',
        color: '#dc2626',
        marginTop: '3px',
        fontFamily: 'Inter, sans-serif',
    },
}

function Field({ label, error, children }) {
    return (
        <div>
            <label style={FIELD_STYLES.label}>{label}</label>
            {children}
            {error && <p style={FIELD_STYLES.error}>{error}</p>}
        </div>
    )
}

function FocusInput({ style, ...props }) {
    const [focused, setFocused] = useState(false)
    return (
        <input
            {...props}
            style={{ ...FIELD_STYLES.input, ...(focused ? FIELD_STYLES.inputFocus : {}), ...style }}
            onFocus={() => setFocused(true)}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
        />
    )
}

const EMPTY_FORM = {
    name: '',
    acronym: '',
    description: '',
    isActive: true,
}

export default function AddOrgModal({ isOpen, onClose, onSave, isLoading = false, error }) {
    const [form, setForm] = useState(EMPTY_FORM)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const overlayRef = useRef(null)
    const firstInputRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            setForm(EMPTY_FORM)
            setErrors({})
            setTimeout(() => firstInputRef.current?.focus(), 50)
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return
        function onKey(e) {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [isOpen, onClose])

    function set(field, value) {
        setForm((f) => ({ ...f, [field]: value }))
        setErrors((e) => ({ ...e, [field]: undefined }))
    }

    function validate() {
        const errs = {}
        if (!form.name.trim()) errs.name = 'Organization name is required.'
        if (!form.acronym.trim()) errs.acronym = 'Acronym is required.'
        return errs
    }

    async function handleSave() {
        const errs = validate()
        if (Object.keys(errs).length) {
            setErrors(errs)
            return
        }
        setSaving(true)
        try {
            await onSave?.({
                name: form.name.trim(),
                acronym: form.acronym.trim().toUpperCase(),
                description: form.description.trim(),
                is_active: form.isActive,
            })
            onClose()
        } finally {
            setSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <div
            ref={overlayRef}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
                padding: '16px',
            }}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: '14px',
                    width: '100%',
                    maxWidth: '520px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '90vh',
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-org-title"
            >
                {/* Header */}
                <div
                    style={{
                        background: '#22c55e', // Green for Add Org
                        padding: '18px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexShrink: 0,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                width: '34px',
                                height: '34px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Building2 style={{ width: '16px', height: '16px', color: '#fff' }} />
                        </div>
                        <div>
                            <h2
                                id="add-org-title"
                                style={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    color: '#fff',
                                    margin: 0,
                                }}
                            >
                                Add New Organization
                            </h2>
                            <p
                                style={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '12px',
                                    color: 'rgba(255,255,255,0.85)',
                                    margin: 0,
                                }}
                            >
                                Register a new student organization
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving || isLoading}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '7px',
                            width: '30px',
                            height: '30px',
                            cursor: saving || isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            opacity: saving || isLoading ? 0.5 : 1,
                        }}
                        aria-label="Close modal"
                    >
                        <X style={{ width: '15px', height: '15px' }} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {error && (
                        <div style={{
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            padding: '12px',
                            fontSize: '13px',
                            color: '#991b1b',
                        }}>
                            {error.message || 'Failed to create organization. Please try again.'}
                        </div>
                    )}

                    {/* Name */}
                    <Field label="Organization Name *" error={errors.name}>
                        <FocusInput
                            ref={firstInputRef}
                            type="text"
                            placeholder="e.g. Society of Computer Engineering Students"
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            disabled={saving || isLoading}
                        />
                    </Field>

                    {/* Acronym */}
                    <Field label="Acronym *" error={errors.acronym}>
                        <FocusInput
                            type="text"
                            placeholder="e.g. SCES"
                            value={form.acronym}
                            onChange={(e) => set('acronym', e.target.value)}
                            disabled={saving || isLoading}
                        />
                    </Field>
                    
                    {/* Description */}
                    <Field label="Description" error={errors.description}>
                        <FocusInput
                            type="text"
                            placeholder="Brief description of the organization"
                            value={form.description}
                            onChange={(e) => set('description', e.target.value)}
                            disabled={saving || isLoading}
                        />
                    </Field>

                    {/* Status toggle */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#f8f9fc',
                            border: '1.5px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '12px 14px',
                        }}
                    >
                        <div>
                            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '600', color: '#374151', margin: 0 }}>
                                Organization Status
                            </p>
                            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b7280', margin: '2px 0 0' }}>
                                {form.isActive ? 'Organization is active and visible.' : 'Organization is inactive.'}
                            </p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={form.isActive}
                            onClick={() => set('isActive', !form.isActive)}
                            disabled={saving || isLoading}
                            style={{
                                width: '42px',
                                height: '24px',
                                borderRadius: '999px',
                                border: 'none',
                                background: form.isActive ? '#22c55e' : '#d1d5db',
                                cursor: saving || isLoading ? 'not-allowed' : 'pointer',
                                position: 'relative',
                                transition: 'background 0.2s',
                                flexShrink: 0,
                                opacity: saving || isLoading ? 0.5 : 1,
                            }}
                        >
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '3px',
                                    left: form.isActive ? '21px' : '3px',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    background: '#fff',
                                    transition: 'left 0.2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                }}
                            />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: '16px 24px',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '10px',
                        flexShrink: 0,
                        background: '#f9fafb',
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving || isLoading}
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#374151',
                            background: '#fff',
                            border: '1.5px solid #d1d5db',
                            borderRadius: '8px',
                            padding: '8px 18px',
                            cursor: saving || isLoading ? 'not-allowed' : 'pointer',
                            transition: 'background 0.15s',
                            opacity: saving || isLoading ? 0.5 : 1,
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || isLoading}
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#fff',
                            background: saving || isLoading ? '#16a34a' : '#22c55e',
                            border: '1.5px solid #16a34a',
                            borderRadius: '8px',
                            padding: '8px 20px',
                            cursor: saving || isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'background 0.15s',
                        }}
                    >
                        <Building2 style={{ width: '13px', height: '13px' }} />
                        {saving || isLoading ? 'Saving...' : 'Add Org'}
                    </button>
                </div>
            </div>
        </div>
    )
}
