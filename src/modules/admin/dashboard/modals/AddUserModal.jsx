import { useEffect, useRef, useState } from 'react'
import { X, UserPlus, Eye, EyeOff } from 'lucide-react'

const ROLES = ['staff', 'student']

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
    select: {
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
        appearance: 'none',
        cursor: 'pointer',
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

function FocusSelect({ children, ...props }) {
    const [focused, setFocused] = useState(false)
    return (
        <div style={{ position: 'relative' }}>
            <select
                {...props}
                style={{ ...FIELD_STYLES.select, ...(focused ? FIELD_STYLES.inputFocus : {}) }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            >
                {children}
            </select>
            <svg
                style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    width: '14px',
                    height: '14px',
                    color: '#6b7280',
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    )
}

const EMPTY_FORM = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    isActive: true,
}

export default function AddUserModal({ isOpen, onClose, onSave, isLoading = false, error }) {
    const [form, setForm] = useState(EMPTY_FORM)
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [saving, setSaving] = useState(false)
    const overlayRef = useRef(null)
    const firstInputRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            setForm(EMPTY_FORM)
            setErrors({})
            setShowPassword(false)
            setShowConfirm(false)
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
        if (!form.fullName.trim()) errs.fullName = 'Full name is required.'
        if (!form.email.trim()) {
            errs.email = 'Email is required.'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errs.email = 'Enter a valid email address.'
        }
        if (!form.password) {
            errs.password = 'Password is required.'
        } else if (form.password.length < 8) {
            errs.password = 'Password must be at least 8 characters.'
        }
        if (!form.confirmPassword) {
            errs.confirmPassword = 'Please confirm the password.'
        } else if (form.password !== form.confirmPassword) {
            errs.confirmPassword = 'Passwords do not match.'
        }
        if (!form.role) errs.role = 'Role is required.'
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
                full_name: form.fullName.trim(),
                email: form.email.trim(),
                password: form.password,
                password_confirm: form.confirmPassword,
                role: form.role,
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
            onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
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
                aria-labelledby="add-user-title"
            >
                {/* Header */}
                <div
                    style={{
                        background: '#1f5cae',
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
                                background: 'rgba(255,255,255,0.18)',
                                borderRadius: '8px',
                                width: '34px',
                                height: '34px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <UserPlus style={{ width: '16px', height: '16px', color: '#fff' }} />
                        </div>
                        <div>
                            <h2
                                id="add-user-title"
                                style={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    color: '#fff',
                                    margin: 0,
                                }}
                            >
                                Add New User
                            </h2>
                            <p
                                style={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '12px',
                                    color: 'rgba(255,255,255,0.7)',
                                    margin: 0,
                                }}
                            >
                                Fill in the details to create a new account
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving || isLoading}
                        style={{
                            background: 'rgba(255,255,255,0.15)',
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
                            {error.message || 'Failed to create user. Please try again.'}
                        </div>
                    )}

                    {/* Full Name */}
                    <Field label="Full Name *" error={errors.fullName}>
                        <FocusInput
                            ref={firstInputRef}
                            type="text"
                            placeholder="e.g. Maria Santos"
                            value={form.fullName}
                            onChange={(e) => set('fullName', e.target.value)}
                            disabled={saving || isLoading}
                        />
                    </Field>

                    {/* Email */}
                    <Field label="Email Address *" error={errors.email}>
                        <FocusInput
                            type="email"
                            placeholder="e.g. maria.santos@gmail.com"
                            value={form.email}
                            onChange={(e) => set('email', e.target.value)}
                            disabled={saving || isLoading}
                        />
                    </Field>

                    {/* Password row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Field label="Password *" error={errors.password}>
                            <div style={{ position: 'relative' }}>
                                <FocusInput
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Min. 8 characters"
                                    value={form.password}
                                    onChange={(e) => set('password', e.target.value)}
                                    style={{ paddingRight: '38px' }}
                                    disabled={saving || isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#9ca3af',
                                        display: 'flex',
                                        padding: 0,
                                    }}
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                                </button>
                            </div>
                        </Field>

                        <Field label="Confirm Password *" error={errors.confirmPassword}>
                            <div style={{ position: 'relative' }}>
                                <FocusInput
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="Re-enter password"
                                    value={form.confirmPassword}
                                    onChange={(e) => set('confirmPassword', e.target.value)}
                                    style={{ paddingRight: '38px' }}
                                    disabled={saving || isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((p) => !p)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#9ca3af',
                                        display: 'flex',
                                        padding: 0,
                                    }}
                                    tabIndex={-1}
                                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                                >
                                    {showConfirm ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                                </button>
                            </div>
                        </Field>
                    </div>

                    {/* Role */}
                    <Field label="Role *" error={errors.role}>
                        <FocusSelect value={form.role} onChange={(e) => set('role', e.target.value)} disabled={saving || isLoading}>
                            <option value="">Select role</option>
                            {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                        </FocusSelect>
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
                                Account Status
                            </p>
                            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b7280', margin: '2px 0 0' }}>
                                {form.isActive ? 'User can log in immediately.' : 'Account is inactive and cannot log in.'}
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
                                background: form.isActive ? '#1f5cae' : '#d1d5db',
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
                            color: '#111827',
                            background: saving || isLoading ? '#e6c900' : '#ffe100',
                            border: '1.5px solid #d4a000',
                            borderRadius: '8px',
                            padding: '8px 20px',
                            cursor: saving || isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'background 0.15s',
                        }}
                    >
                        <UserPlus style={{ width: '13px', height: '13px' }} />
                        {saving || isLoading ? 'Saving...' : 'Add User'}
                    </button>
                </div>
            </div>
        </div>
    )
}
