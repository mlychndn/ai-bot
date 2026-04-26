function ClearModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Clear chat history?</h2>
        <p className="mt-2 text-sm text-slate-600">
          This will permanently remove all messages from this session.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            type="button"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClearModal;
