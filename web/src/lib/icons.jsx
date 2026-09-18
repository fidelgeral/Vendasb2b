export function Ico({ size = 16, color, style, children }) {
  const stroke = color || (style && style.color) || "currentColor";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {children}
    </svg>
  );
}
export function ShoppingCart(p) { return <Ico {...p}><path d="M3 4h2l1 4m0 0l1.5 8h9l2-8H7" /><circle cx="9" cy="19" r="1.3" /><circle cx="16" cy="19" r="1.3" /></Ico>; }
export function LayoutGrid(p) { return <Ico {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></Ico>; }
export function Banknote(p) { return <Ico {...p}><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /></Ico>; }
export function Package(p) { return <Ico {...p}><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></Ico>; }
export function Boxes(p) { return <Ico {...p}><rect x="3" y="9" width="9" height="9" rx="1" /><rect x="12" y="4" width="9" height="9" rx="1" /></Ico>; }
export function Users(p) { return <Ico {...p}><circle cx="8" cy="8" r="3.2" /><path d="M2.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" /><circle cx="17" cy="9" r="2.4" /><path d="M14.5 13.3c2.6.3 5 2.3 5 6.7" /></Ico>; }
export function Truck(p) { return <Ico {...p}><rect x="1" y="7" width="13" height="9" rx="1" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="6" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></Ico>; }
export function UserCog(p) { return <Ico {...p}><circle cx="9" cy="7" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="18" cy="17" r="2.3" /><path d="M18 13.5v1.2M18 19.3v1.2M14.5 17h1.2M20.3 17h1.2" /></Ico>; }
export function Scale(p) { return <Ico {...p}><path d="M12 3v14" /><path d="M5 7h14" /><path d="M5 7l-2 6h6l-2-6" /><path d="M19 7l-2 6h6l-2-6" /><path d="M8 21h8" /></Ico>; }
export function Settings(p) { return <Ico {...p}><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M4.2 7.5l2.2 1.3M17.6 15.2l2.2 1.3M4.2 16.5l2.2-1.3M17.6 8.8l2.2-1.3M3 12h2.5M18.5 12H21" /></Ico>; }
export function Plus(p) { return <Ico {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Ico>; }
export function Minus(p) { return <Ico {...p}><line x1="5" y1="12" x2="19" y2="12" /></Ico>; }
export function Trash2(p) { return <Ico {...p}><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13h10l1-13" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></Ico>; }
export function X(p) { return <Ico {...p}><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></Ico>; }
export function AlertTriangle(p) { return <Ico {...p}><path d="M12 3l10 18H2z" /><line x1="12" y1="9" x2="12" y2="14" /><line x1="12" y1="16.4" x2="12" y2="16.7" /></Ico>; }
export function CheckCircle2(p) { return <Ico {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></Ico>; }
export function Wallet(p) { return <Ico {...p}><rect x="2" y="6" width="20" height="14" rx="2" /><path d="M2 10h20" /><circle cx="17" cy="14.5" r="1.2" /></Ico>; }
export function Smartphone(p) { return <Ico {...p}><rect x="6" y="2" width="12" height="20" rx="2" /><line x1="10" y1="19" x2="14" y2="19" /></Ico>; }
export function Landmark(p) { return <Ico {...p}><path d="M3 21h18" /><path d="M5 21V10" /><path d="M19 21V10" /><path d="M9 21V10" /><path d="M15 21V10" /><path d="M2 10l10-6 10 6" /></Ico>; }
export function HandCoins(p) { return <Ico {...p}><circle cx="9" cy="9" r="4" /><circle cx="15" cy="15" r="4" /></Ico>; }
export function Lock(p) { return <Ico {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Ico>; }
export function Percent(p) { return <Ico {...p}><line x1="19" y1="5" x2="5" y2="19" /><circle cx="7" cy="7" r="2.3" /><circle cx="17" cy="17" r="2.3" /></Ico>; }
export function Split(p) { return <Ico {...p}><path d="M12 4v6" /><path d="M12 10l-6 8" /><path d="M12 10l6 8" /></Ico>; }
export function PauseCircle(p) { return <Ico {...p}><circle cx="12" cy="12" r="9" /><line x1="10" y1="9" x2="10" y2="15" /><line x1="14" y1="9" x2="14" y2="15" /></Ico>; }
export function PlayCircle(p) { return <Ico {...p}><circle cx="12" cy="12" r="9" /><path d="M10 8.5l6 3.5-6 3.5z" /></Ico>; }
export function Layers(p) { return <Ico {...p}><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></Ico>; }
export function Ruler(p) { return <Ico {...p}><rect x="3" y="9" width="18" height="6" rx="1" /><line x1="7" y1="9" x2="7" y2="12" /><line x1="11" y1="9" x2="11" y2="12" /><line x1="15" y1="9" x2="15" y2="12" /><line x1="19" y1="9" x2="19" y2="12" /></Ico>; }
export function ChevronLeft(p) { return <Ico {...p}><path d="M15 5l-7 7 7 7" /></Ico>; }
export function Star(p) { return <Ico {...p}><path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.9 6.4 20.1l1.4-6.3-4.8-4.3 6.4-.6z" /></Ico>; }
export function Bell(p) { return <Ico {...p}><path d="M6 10a6 6 0 0 1 12 0v5l2 3H4l2-3z" /><path d="M10 20a2 2 0 0 0 4 0" /></Ico>; }
export function Link2(p) { return <Ico {...p}><rect x="3" y="9" width="8" height="6" rx="3" /><rect x="13" y="9" width="8" height="6" rx="3" /><line x1="9" y1="12" x2="15" y2="12" /></Ico>; }
export function LogOut(p) { return <Ico {...p}><path d="M15 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9" /><line x1="10" y1="12" x2="21" y2="12" /><path d="M17 8l4 4-4 4" /></Ico>; }
export function ArrowDownCircle(p) { return <Ico {...p}><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><path d="M9 13l3 3 3-3" /></Ico>; }
export function ArrowUpCircle(p) { return <Ico {...p}><circle cx="12" cy="12" r="9" /><line x1="12" y1="16" x2="12" y2="8" /><path d="M9 11l3-3 3 3" /></Ico>; }
export function PackageX(p) { return <Ico {...p}><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><line x1="9.5" y1="14" x2="14.5" y2="18" /><line x1="14.5" y1="14" x2="9.5" y2="18" /></Ico>; }
export function ImageOff(p) { return <Ico {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="3" x2="21" y2="21" /><circle cx="9" cy="9" r="1.6" /><path d="M21 15l-5-5-4 4" /></Ico>; }
