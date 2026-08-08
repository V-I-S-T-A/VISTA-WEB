import { useEffect, useRef, useState } from 'react'
import { X, Building2, ImagePlus, Trash2 } from 'lucide-react'

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

function PhotoDropzone({ preview, error, onSelect, onRemove, disabled }) {
    const [dragOver, setDragOver] = useState(false)
    const inputRef = useRef(null)

    function handleFiles(fileList) {
        const file = fileList?.[0]
        if (file && file.type.startsWith('image/')) {
            onSelect(file)
        }
    }

    return (
        <div>
            {preview ? (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        border: '1.5px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '10px',
                    }}
                >
                    <img
                        src={preview}
                        alt="Organization preview"
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            flexShrink: 0,
                            border: '1px solid #e5e7eb',
                        }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '600', color: '#374151', margin: 0 }}>
                            Photo selected
                        </p>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b7280', margin: '2px 0 0' }}>
                            Click remove to choose a different photo.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onRemove}
                        disabled={disabled}
                        aria-label="Remove photo"
                        style={{
                            background: '#fee2e2',
                            border: 'none',
                            borderRadius: '7px',
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            color: '#dc2626',
                            flexShrink: 0,
                        }}
                    >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                    </button>
                </div>
            ) : (
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => !disabled && inputRef.current?.click()}
                    onKeyDown={(e) => {
                        if (!disabled && (e.key === 'Enter' || e.key === ' ')) inputRef.current?.click()
                    }}
                    onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                        e.preventDefault()
                        setDragOver(false)
                        if (!disabled) handleFiles(e.dataTransfer.files)
                    }}
                    style={{
                        border: `1.5px dashed ${error ? '#dc2626' : dragOver ? '#1f5cae' : '#d1d5db'}`,
                        borderRadius: '8px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: dragOver ? '#f0f6ff' : '#f9fafb',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        transition: 'background 0.15s, border-color 0.15s',
                    }}
                >
                    <ImagePlus style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '600', color: '#374151', margin: 0 }}>
                        Click to upload or drag and drop
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                        PNG, JPG up to a few MB
                    </p>
                </div>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                style={{ display: 'none' }}
                disabled={disabled}
                onChange={(e) => {
                    handleFiles(e.target.files)
                    e.target.value = ''
                }}
            />
        </div>
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
    const [photo, setPhoto] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    const overlayRef = useRef(null)
    const firstInputRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            setForm(EMPTY_FORM)
            setErrors({})
            setPhoto(null)
            setPhotoPreview(null)
            setTimeout(() => firstInputRef.current?.focus(), 50)
        }
    }, [isOpen])

    // Revoke the local object URL on unmount / replacement to avoid leaking
    // memory across repeated selections.
    useEffect(() => {
        return () => {
            if (photoPreview) URL.revokeObjectURL(photoPreview)
        }
    }, [photoPreview])

    function handlePhotoSelect(file) {
        const nextPreview = URL.createObjectURL(file)
        setPhotoPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev)
            return nextPreview
        })
        setPhoto(file)
        setErrors((e) => ({ ...e, photo: undefined }))
    }

    function handlePhotoRemove() {
        setPhotoPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev)
            return null
        })
        setPhoto(null)
    }

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
        if (!photo) errs.photo = 'Organization photo is required.'
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
                image: photo,
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

                    {/* Photo */}
                    <Field label="Add Photo *" error={errors.photo}>
                        <PhotoDropzone
                            preview={photoPreview}
                            error={errors.photo}
                            onSelect={handlePhotoSelect}
                            onRemove={handlePhotoRemove}
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