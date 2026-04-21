import { MJ_TOKENS, MJ_FONTS } from './tokens';

const PATTERN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><defs><pattern id="p" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="rgba(0,0,0,0.05)" stroke-width="3"/></pattern></defs><rect width="100%" height="100%" fill="url(#p)"/></svg>`,
  );

export function Placeholder({
  label = 'logo',
  w = 40,
  h = 40,
  rounded = 6,
}: {
  label?: string;
  w?: number;
  h?: number;
  rounded?: number;
}) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: rounded,
        background: MJ_TOKENS.bgAlt,
        backgroundImage: `url("${PATTERN}")`,
        backgroundSize: '12px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: MJ_FONTS.mono,
        fontSize: Math.max(9, Math.min(11, w / 4)),
        color: MJ_TOKENS.textSoft,
        border: `1px solid ${MJ_TOKENS.line}`,
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  );
}
