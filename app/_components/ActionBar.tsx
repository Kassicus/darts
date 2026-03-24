interface ActionBarProps {
  onMiss: () => void;
  onUndo: () => void;
  canUndo: boolean;
  disabled: boolean;
}

export function ActionBar({ onMiss, onUndo, canUndo, disabled }: ActionBarProps) {
  return (
    <div className="flex gap-3 mt-3 w-full">
      <button
        onClick={onMiss}
        disabled={disabled}
        className="flex-1 py-4 px-6 rounded-xl bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white font-bold text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Miss
      </button>
      <button
        onClick={onUndo}
        disabled={!canUndo || disabled}
        className="flex-1 py-4 px-6 rounded-xl bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-300 font-medium text-base border border-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Undo
      </button>
    </div>
  );
}
