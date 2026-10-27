import { useId } from "react";

// Individual vector pieces keep the campus artwork sharp at every display size.
export default function CampusArtwork() {
  const id = useId().replaceAll(":", "");
  const sky = `${id}-sky`;
  const glass = `${id}-glass`;
  return <svg viewBox="0 0 1200 280" fill="none" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={sky} x1="0" y1="0" x2="1200" y2="280" gradientUnits="userSpaceOnUse"><stop stopColor="#7cc9ec"/><stop offset="1" stopColor="#abd7af"/></linearGradient>
      <linearGradient id={glass} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#d8f0ff"/><stop offset="1" stopColor="#4697df"/></linearGradient>
    </defs>
    <path d="M0 230C170 110 250 290 440 175S700 80 820 170 1090 60 1200 140V280H0Z" fill={`url(#${sky})`}/>
    <path d="M0 265C270 180 330 310 610 190S970 190 1200 175V280H0Z" fill="#50b591"/>
    <path d="M0 270C250 160 490 310 720 213S1050 202 1200 186" stroke="#cbe5af" strokeWidth="3"/>
    <circle cx="1070" cy="55" r="32" fill="#ffd064"/>
    <g fill="#e4f2fa" opacity=".65"><path d="M30 48a20 20 0 0 1 38-7 27 27 0 0 1 44 15H12a18 18 0 0 1 18-8Z"/><path d="M790 38a16 16 0 0 1 29-7 22 22 0 0 1 40 13h-85a14 14 0 0 1 16-6Z"/></g>
    <g opacity=".9">
      {[{x:590,y:90,w:52,h:138},{x:660,y:45,w:62,h:177},{x:738,y:106,w:50,h:119},{x:804,y:72,w:58,h:157},{x:878,y:114,w:50,h:113}].map(({x,y,w,h},i)=><g key={x}>
        <path d={`M${x} ${y}l${w} -17v${h}l-${w} 17Z`} fill={`url(#${glass})`}/>
        <path d={`M${x+w} ${y-17}l18 10v${h}l-18-10Z`} fill={i%2?"#447dc0":"#8b97d4"}/>
        <path d={`M${x} ${y}l${w}-17 18 10-${w} 17Z`} fill="#c3e7ef"/>
        {[1,2,3,4,5].map(row=><path key={row} d={`M${x+9} ${y+row*h/7}l${w-18}-10`} stroke="#e1f4ff" strokeWidth="5"/>)}</g>)}
    </g>
    <g transform="translate(420 201)"><ellipse rx="48" ry="17" fill="#173c7f"/><path d="M-48-9v10a48 17 0 0 0 96 0V-9" fill="#427bba"/><ellipse cy="-9" rx="48" ry="17" fill="#8bc6e4"/><path d="M0-9l34-12a48 17 0 0 1 14 12Z" fill="#ffcc63"/><path d="M0-9l-36 11a48 17 0 0 1-12-11Z" fill="#899adb"/></g>
    <g transform="translate(518 226)"><path d="M0 0v-46l25-7v46ZM35-10v-70l25-7v70ZM70-22v-103l25-7v103Z" fill="#a5e3e5" stroke="#d4f2f3" strokeWidth="2"/></g>
    <g transform="translate(994 128) rotate(13)"><rect width="67" height="87" rx="7" fill="#d9eff5"/><path d="M13 22h40M13 34h26M13 46h35" stroke="#498cc7" strokeWidth="4" strokeLinecap="round"/><path d="m23 65 8 8 18-19" stroke="#55ae84" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></g>
    <g stroke="#e4f2fa" strokeWidth="2" strokeLinecap="round"><path d="m976 51 8 3 7-5m-52 17 6 3 7-4m-18-33 7 3 6-5"/></g>
    <g transform="translate(1137 217)"><path d="M0-64 21-12H7L27 7H-27L-7-12H-21Z" fill="#277f74"/><path d="M0 3v23" stroke="#8ec6b1" strokeWidth="5"/></g>
    <path d="M260 280c54-38 93-54 173-52" stroke="#b5d4d1" strokeWidth="12"/>
  </svg>;
}
