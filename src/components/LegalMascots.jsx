import { useId } from "react";
import students from "../assets/legal/waving-students.webp";

// Separate the forearms from the same illustration so the hands wave while
// the characters' faces, folder and bodies stay in place.
const LEFT_ARM = "M 0 0 H 280 V 390 L 151 490 L 143 521 L 165 629 L 115 669 H 0 Z";
const RIGHT_ARM = "M 1320 598 L 1350 500 L 1363 420 L 1355 402 L 1328 345 L 1322 308 L 1342 298 L 1373 323 L 1393 270 L 1408 248 L 1425 255 L 1425 318 L 1438 264 L 1456 251 L 1472 268 L 1455 320 L 1478 279 L 1497 275 L 1508 292 L 1467 347 L 1497 330 L 1518 333 L 1526 351 L 1473 403 L 1430 428 L 1415 540 L 1397 653 Z";

export default function LegalMascots() {
  const id = useId().replaceAll(":", "");
  return <svg className="legal-mascots" viewBox="0 0 1536 1024" aria-hidden="true" focusable="false">
    <defs>
      <clipPath id={`${id}-left`}><path d={LEFT_ARM} /></clipPath>
      <clipPath id={`${id}-right`}><path d={RIGHT_ARM} /></clipPath>
      <mask id={`${id}-body`} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024">
        <rect width="1536" height="1024" fill="white" />
        <path d={LEFT_ARM} fill="black" /><path d={RIGHT_ARM} fill="black" />
      </mask>
    </defs>
    <image href={students} width="1536" height="1024" mask={`url(#${id}-body)`} />
    <g className="legal-wave-left"><image href={students} width="1536" height="1024" clipPath={`url(#${id}-left)`} /></g>
    <g className="legal-wave-right"><image href={students} width="1536" height="1024" clipPath={`url(#${id}-right)`} /></g>
  </svg>;
}
