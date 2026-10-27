import { useId } from "react";
import students from "../../assets/public/campus-students.webp";
import "./CampusScene.css";

const TOWERS = [
  [0, 100, 110, 270, "blue"], [108, 162, 72, 200, "mint"],
  [193, 120, 73, 240, "lilac"], [290, 151, 87, 215, "mint"],
  [392, 87, 91, 280, "blue"], [490, 182, 72, 180, "lilac"],
  [571, 130, 79, 235, "mint"], [672, 55, 105, 310, "blue"],
  [961, 141, 84, 225, "blue"], [1061, 88, 106, 280, "mint"],
  [1180, 137, 78, 230, "lilac"], [1275, 63, 111, 305, "blue"],
  [1390, 152, 81, 220, "mint"],
];

function Tower({ spec: [x, y, width, height, color], id }) {
  return <g>
    <path d={`M${x + width} ${y - 12}l20 12v${height}l-20 12Z`} fill={`url(#${id}-${color}-side)`} />
    <path d={`M${x} ${y}l${width}-12 20 12-${width} 12Z`} fill="#e2f3fb" />
    <path d={`M${x} ${y}l${width}-12v${height}l-${width} 12Z`} fill={`url(#${id}-${color})`} />
    <path d={`M${x + 7} ${y + 9}l${width - 14}-10v${height - 20}l-${width - 14} 10Z`} fill={`url(#${id}-windows)`} opacity=".72" />
    <path d={`M${x + width * .62} ${y - 7}l${width * .3}-4-${width * .5} ${height + 5}h-${width * .2}Z`} fill="#e5f5ff" opacity=".28" />
    <path d={`M${x} ${y + 2}v${height}M${x + width} ${y - 10}v${height}`} stroke="#d3efff" strokeWidth="2" />
    <path d={`M${x - 2} ${y + height * .64}l${width + 4}-12 20 12-${width + 4} 12Z`} fill="#90b7d2" />
    <path d={`M${x - 2} ${y + height * .64 + 2}l${width + 4}-12`} stroke="#e2f4ff" strokeWidth="3" />
  </g>;
}

function Skyline({ portrait }) {
  const id = `city-${useId().replaceAll(":", "")}`;
  return <svg className="campus-scene-city" fill="none" viewBox={portrait ? "420 0 460 430" : "0 -25 1440 385"} preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
    <defs>
      <pattern id={`${id}-windows`} width="13" height="18" patternUnits="userSpaceOnUse"><rect x="3" y="3" width="6" height="11" rx=".6" fill="#f1faff" /><path d="M0 17h13" stroke="#4c8ab9" strokeWidth=".6" /></pattern>
      {[["blue", "#8ad7f0", "#527fd2", "#244b99"], ["mint", "#c1ecdf", "#77b7da", "#3c8dbd"], ["lilac", "#ddd9f7", "#899bda", "#5963ac"]].map(([name, top, bottom, side]) => <g key={name}>
        <linearGradient id={`${id}-${name}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient>
        <linearGradient id={`${id}-${name}-side`}><stop stopColor={bottom} /><stop offset="1" stopColor={side} /></linearGradient>
      </g>)}
      <linearGradient id={`${id}-distance`} x2="0" y2="1"><stop stopColor="#a0cce9" /><stop offset="1" stopColor="#f7dfc8" /></linearGradient>
      <linearGradient id={`${id}-avenue`} x2="0" y2="1"><stop stopColor="#e7d5df" /><stop offset="1" stopColor="#7094c5" /></linearGradient>
    </defs>
    <g fill={`url(#${id}-distance)`} opacity=".7">
      {Array.from({ length: 31 }, (_, i) => { const height = 35 + ((i * 29) % 100); return <path key={i} d={`M${i * 48} 355v-${height}h11v-14h15v14h13v${height}Z`} />; })}
    </g>
    <path d="M848 283 730 370h300L875 283Z" fill={`url(#${id}-avenue)`} />
    <g stroke="#eff5ff" strokeWidth="2" opacity=".85"><path d="m854 290-80 80m94-80 108 80m-115-80-6 80" /><path d="m822 317 92 0m-135 28h185" /></g>
    <g opacity=".48" transform="translate(171 80) scale(.72)">{TOWERS.slice(2, 12).map(spec => <Tower key={spec[0]} spec={spec} id={id} />)}</g>
    {TOWERS.map(spec => <Tower key={spec[0]} spec={spec} id={id} />)}
    <g>
      <path d="M236 360 251 93h12l16 267" fill="#b7bfe7" stroke="#eef6ff" strokeWidth="2" />
      <path d="M251 93V22h10v71M253 22V0" stroke="#83badf" strokeWidth="5" />
      <ellipse cx="257" cy="94" rx="33" ry="10" fill="#d6e8f6" /><path d="M224 94v8c17 14 49 14 66 0v-8" fill="#7e9bd1" /><ellipse cx="257" cy="94" rx="27" ry="6" fill="#a6cee5" />
      <path d="M706 57V29h28v28M715 29V0h8v29" fill="#bce8e8" stroke="#e9faff" strokeWidth="2" />
    </g>
    <g>
      {[[21, 320, 156], [1080, 327, 126], [1290, 300, 134]].map(([x, y, width]) => <g key={x}>
        <path d={`M${x} ${y}h${width}v55H${x}Z`} fill="#6d8cba" /><path d={`M${x} ${y}h${width}l-12-12H${x + 12}Z`} fill="#73bdb0" />
        <path d={`M${x - 2} ${y}h${width + 4}`} stroke="#e3f6f6" strokeWidth="5" />
        {[22, 48, 75, 100].filter(offset => offset < width - 12).map(offset => <g key={offset}><path d={`M${x + offset} ${y - 8}v-10`} stroke="#6c956f" strokeWidth="3" /><circle cx={x + offset} cy={y - 22} r="10" fill={offset % 2 ? "#b2d7b4" : "#c5c0e3"} /></g>)}
      </g>)}
    </g>
  </svg>;
}

export default function CampusScene({ portrait = false, compact = false }) {
  return <div className={`campus-scene campus-scene--${portrait ? "portrait" : "panorama"}${compact ? " campus-scene--compact" : ""}`} aria-hidden="true">
    <div className="campus-scene-sun" />
    <svg className="campus-scene-clouds" fill="none" viewBox="0 0 1440 360" preserveAspectRatio="xMidYMin slice" focusable="false">
      <g fill="#fff8e8"><path d="M-30 98C-8 58 35 62 56 78 57 33 123 23 143 60 174 39 206 55 209 86 253 62 286 94 280 115H-30Z" /><path d="M1100 112c-7-29 24-54 50-38 12-48 69-49 88-13 35-28 76-11 79 24 38-19 75 3 74 30 29-8 55 6 67 27h-358Z" /></g>
      <g fill="#f5edee" opacity=".8"><path d="M-20 136c59-33 116 35 199 9s103 7 146 24c-109-15-177 16-253-3-43-11-67-7-92-4Z" /><path d="M1073 154c55-24 78 14 132 5s89-18 148 3c-114 20-163 2-280-8Z" /></g>
      <path d="M363 37c137 22 241 31 369 13M892 78c96-3 162-14 258-44" stroke="#ecf7ff" strokeWidth="3" opacity=".6" />
      <g stroke="#7ca4ca" strokeWidth="2" fill="none" strokeLinecap="round"><path d="m877 110 8 4 9-6m35 25 8 3 8-5m-77-48 6 3 7-5" /></g>
    </svg>
    <Skyline portrait={portrait} />
    {portrait && <>
      <svg className="campus-scene-meadow" viewBox="0 0 400 240" preserveAspectRatio="none" focusable="false"><path d="M0 76c113-77 198 5 400-59v223H0Z" fill="#b4dc92" /><path d="M0 133C133 38 216 160 400 81v159H0Z" fill="#70ba8b" /><path d="M0 207c120-74 225-19 400-57v90H0Z" fill="#c2dda0" /><path d="M0 191c136-86 260 6 400-58" stroke="#e6e9b5" strokeWidth="4" fill="none" /></svg>
      <img className="campus-scene-students" src={students} alt="" width="1254" height="1254" loading="lazy" decoding="async" />
    </>}
  </div>;
}
