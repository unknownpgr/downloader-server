import { Pagination } from "react-bootstrap";
import { useEffect } from "react";

export function Pages({ max, value, onChange, M = 3 }) {
  // 2*M+1 items will be shown.
  const N = 2 * M + 1;
  let midLeft = Math.max(2, Math.min(max - N + 2, value - (M - 1)));
  let midRight = Math.min(max - 1, Math.max(N - 1, value + (M - 1)));
  let midButtonNum = midRight - midLeft + 1;

  useEffect(() => {
    if (max > 0 && value > max) {
      onChange(max);
    }
  }, [onChange, max, value]);

  return (
    <Pagination className="w-100 justify-content-center mt-3">
      {max > 1 && (
        <Pagination.Item active={value === 1} onClick={() => onChange(1)}>
          1
        </Pagination.Item>
      )}
      {midLeft > 2 && <Pagination.Ellipsis />}
      {midButtonNum > 0 &&
        new Array(midButtonNum).fill(0).map((_, i) => {
          const index = midLeft + i;
          return (
            <Pagination.Item
              active={index === value}
              key={index}
              onClick={() => onChange(index)}>
              {index}
            </Pagination.Item>
          );
        })}
      {midRight < max - 2 && <Pagination.Ellipsis />}
      {max > 1 && (
        <Pagination.Item active={value === max} onClick={() => onChange(max)}>
          {max}
        </Pagination.Item>
      )}
    </Pagination>
  );
}
