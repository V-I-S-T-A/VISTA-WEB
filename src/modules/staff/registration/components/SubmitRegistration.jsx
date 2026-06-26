import { CloudUpload } from 'lucide-react'

export default function SubmitRegistration({ onSubmit }) {
  return (
    <div>
      {/* Secure File Upload */}
      <p
        className="font-inter font-bold text-[#142d55] uppercase"
        style={{ fontSize: '12px', letterSpacing: '0.04em', marginBottom: '8px' }}
      >
        Secure File Upload
      </p>
      <div
        style={{
          border: '2px dashed #d1d5db',
          borderRadius: '12px',
          padding: '32px 24px',
          textAlign: 'center',
          marginBottom: '28px',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1f5cae')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
      >
        <CloudUpload
          style={{
            width: '36px',
            height: '36px',
            color: '#9ca3af',
            margin: '0 auto 10px',
          }}
        />
        <p
          className="font-inter font-semibold text-gray-700"
          style={{ fontSize: '13px' }}
        >
          Click to upload or drag and drop
        </p>
        <p
          className="font-inter text-gray-400"
          style={{ fontSize: '11px', marginTop: '4px' }}
        >
          PDF, DOCX, or XLSX up to 50MB
        </p>
      </div>

      {/* Submit Button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={onSubmit}
          className="font-inter font-bold uppercase tracking-wider transition hover:bg-[#e6c900] active:scale-95"
          style={{
            fontSize: '13px',
            padding: '10px 28px',
            backgroundColor: '#ffe100',
            color: '#111827',
            border: '2px solid #1f5cae',
            borderRadius: '6px',
            cursor: 'pointer',
            letterSpacing: '0.06em',
          }}
        >
          Submit Registration
        </button>
      </div>
    </div>
  )
}
