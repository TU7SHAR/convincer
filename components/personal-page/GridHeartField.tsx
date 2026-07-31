import type { CSSProperties } from "react";

const GRID_HEARTS = [
  { column: 2, row: 3, delay: "-1s", size: "0.78rem" },
  { column: 4, row: 9, delay: "-7s", size: "0.58rem" },
  { column: 7, row: 5, delay: "-4s", size: "0.9rem" },
  { column: 10, row: 12, delay: "-10s", size: "0.64rem" },
  { column: 13, row: 3, delay: "-6s", size: "0.72rem" },
  { column: 16, row: 8, delay: "-2s", size: "1rem" },
  { column: 19, row: 14, delay: "-9s", size: "0.62rem" },
  { column: 22, row: 5, delay: "-5s", size: "0.82rem" },
  { column: 25, row: 10, delay: "-12s", size: "0.56rem" },
  { column: 28, row: 2, delay: "-3s", size: "0.9rem" },
  { column: 31, row: 13, delay: "-8s", size: "0.68rem" },
  { column: 34, row: 6, delay: "-11s", size: "0.76rem" },
  { column: 37, row: 11, delay: "0s", size: "0.6rem" },
  { column: 40, row: 4, delay: "-6s", size: "0.92rem" },
] as const;

type HeartStyle = CSSProperties & {
  "--heart-column": number;
  "--heart-row": number;
  "--heart-delay": string;
  "--heart-size": string;
};

export function GridHeartField() {
  return (
    <div className="grid-heart-field" aria-hidden="true">
      {GRID_HEARTS.map((heart) => {
        const style: HeartStyle = {
          "--heart-column": heart.column,
          "--heart-row": heart.row,
          "--heart-delay": heart.delay,
          "--heart-size": heart.size,
        };

        return (
          <span
            className="grid-heart"
            key={`${heart.column}-${heart.row}`}
            style={style}
          >
            ♥
          </span>
        );
      })}
    </div>
  );
}
