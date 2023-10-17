import { useEffect } from "react";

export function Pages({
  max,
  value,
  onChange,
  M = 3,
}: {
  max: number;
  value: number;
  onChange: (value: number) => void;
  M?: number;
}) {
  // 2*M+1 items will be shown.
  const N = 2 * M + 1;
  const midLeft = Math.max(2, Math.min(max - N + 2, value - (M - 1)));
  const midRight = Math.min(max - 1, Math.max(N - 1, value + (M - 1)));
  const midButtonNum = midRight - midLeft + 1;

  useEffect(() => {
    if (max > 0 && value > max) {
      onChange(max);
    }
  }, [onChange, max, value]);

  return (
    <div className="w-full flex justify-center my-4">
      {max > 1 && (
        <button
          className="bg-slate-200 px-4 py-1 text-slate-500 font-medium rounded-l-lg disabled:bg-slate-300 text-slate-600"
          disabled={value === 1}
          onClick={() => onChange(1)}>
          1
        </button>
      )}
      {
        <button
          hidden={midLeft < 3}
          className="bg-slate-200 px-4 py-1 text-slate-500 font-medium "
          disabled>
          ...
        </button>
      }
      {midButtonNum > 0 &&
        new Array(midButtonNum).fill(0).map((_, i) => {
          const index = midLeft + i;
          return (
            <button
              className="bg-slate-200 px-4 py-1 text-slate-500 font-medium disabled:bg-slate-300 text-slate-600"
              disabled={value === index}
              key={index}
              onClick={() => onChange(index)}>
              {index}
            </button>
          );
        })}
      {midRight < max - 2 && (
        <button
          className="bg-slate-200 px-4 py-1 text-slate-500 font-medium "
          disabled>
          ...
        </button>
      )}
      {max > 1 && (
        <button
          className="bg-slate-200 px-4 py-1 text-slate-500 font-medium rounded-r-lg disabled:bg-slate-300 text-slate-600"
          onClick={() => onChange(max)}
          disabled={value === max}>
          {max}
        </button>
      )}
    </div>
  );
}
