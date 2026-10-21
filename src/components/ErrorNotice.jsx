export default function ErrorNotice({ message, onRetry, retrying = false }) {
  if (!message) return null;
  return (
    <div role="alert" className="my-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} disabled={retrying}
          className="mt-2 font-semibold underline disabled:opacity-50">
          {retrying ? "Retrying…" : "Try again"}
        </button>
      )}
    </div>
  );
}
