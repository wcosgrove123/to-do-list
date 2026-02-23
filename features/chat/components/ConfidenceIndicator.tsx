'use client';

interface ConfidenceIndicatorProps {
  confidence: number; // 0.0 to 1.0
}

export function ConfidenceIndicator({ confidence }: ConfidenceIndicatorProps) {
  const percentage = Math.round(confidence * 100);

  const getColor = () => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getLabel = () => {
    if (confidence >= 0.8) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Low confidence';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              confidence >= 0.8
                ? 'bg-green-500'
                : confidence >= 0.6
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span className={`text-xs font-medium ${getColor()}`}>
        {getLabel()} ({percentage}%)
      </span>
    </div>
  );
}
