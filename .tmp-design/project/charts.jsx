// ============================================================
// Hand-rolled SVG charts — radar, line, sparkline
// ============================================================
// React hooks accessed via React.* to avoid scope collisions across files

// -------- RADAR CHART --------
function RadarChart({ data, size = 380, dark = false }) {
  // data: { groupName: value, ... } where MUSCLE_GROUPS gives axis order
  const groups = window.MUSCLE_GROUPS;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const max = Math.max(...groups.map(g => data[g] || 0));
  const niceMax = Math.ceil(max / 20) * 20;

  const angleFor = (i) => -Math.PI / 2 + (i / groups.length) * Math.PI * 2;
  const point = (i, r) => {
    const a = angleFor(i);
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };

  const ringLevels = [0.25, 0.5, 0.75, 1];
  const polyPoints = groups.map((g, i) => {
    const v = (data[g] || 0) / niceMax;
    const [x, y] = point(i, radius * v);
    return `${x},${y}`;
  }).join(' ');

  const stroke = dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.10)';
  const labelColor = dark ? 'rgba(255,255,255,0.55)' : 'var(--muted)';

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ display: 'block', maxHeight: 380 }}>
      {/* concentric polygons */}
      {ringLevels.map((lv, idx) => {
        const pts = groups.map((_, i) => {
          const [x, y] = point(i, radius * lv);
          return `${x},${y}`;
        }).join(' ');
        return (
          <polygon key={idx}
            points={pts}
            fill="none"
            stroke={stroke}
            strokeWidth={idx === ringLevels.length - 1 ? 1.2 : 0.7}
            strokeDasharray={idx === ringLevels.length - 1 ? "none" : "2 4"}
          />
        );
      })}

      {/* axes */}
      {groups.map((g, i) => {
        const [x, y] = point(i, radius);
        return (
          <line key={g} x1={cx} y1={cy} x2={x} y2={y}
            stroke={stroke} strokeWidth="0.7" />
        );
      })}

      {/* data polygon */}
      <polygon
        points={polyPoints}
        fill="var(--accent)"
        fillOpacity="0.18"
        stroke="var(--accent)"
        strokeWidth="1.5"
      />

      {/* data points */}
      {groups.map((g, i) => {
        const v = (data[g] || 0) / niceMax;
        const [x, y] = point(i, radius * v);
        return (
          <circle key={g} cx={x} cy={y} r="4"
            fill={dark ? 'var(--ink)' : 'var(--paper)'}
            stroke="var(--accent)" strokeWidth="2" />
        );
      })}

      {/* labels */}
      {groups.map((g, i) => {
        const [lx, ly] = point(i, radius * 1.18);
        const a = angleFor(i);
        let anchor = 'middle';
        if (Math.cos(a) > 0.3) anchor = 'start';
        else if (Math.cos(a) < -0.3) anchor = 'end';
        return (
          <text key={g}
            x={lx} y={ly}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontFamily="var(--mono)"
            fontSize="10"
            letterSpacing="2"
            fill={labelColor}
            style={{ textTransform: 'uppercase' }}
          >
            {g.toUpperCase()}
          </text>
        );
      })}
    </svg>
  );
}

// -------- LINE CHART --------
function LineChart({ values, labels, height = 240, dark = false }) {
  const W = 720;
  const H = height;
  const padL = 36, padR = 16, padT = 24, padB = 32;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const niceMax = Math.ceil(max / 10) * 10;
  const niceMin = Math.floor(min / 10) * 10;
  const range = niceMax - niceMin || 1;

  const stepX = innerW / (values.length - 1);
  const points = values.map((v, i) => {
    const x = padL + stepX * i;
    const y = padT + innerH - ((v - niceMin) / range) * innerH;
    return [x, y];
  });

  const path = points.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ');
  const areaPath = `${path} L ${points[points.length - 1][0]} ${padT + innerH} L ${points[0][0]} ${padT + innerH} Z`;

  const grid = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const labelCol = dark ? 'rgba(255,255,255,0.45)' : 'var(--muted)';

  // y-axis ticks
  const yTicks = 4;
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => niceMin + (range * i) / yTicks);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.20" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* y-axis grid lines + labels */}
      {yTickVals.map((v, i) => {
        const y = padT + innerH - (i / yTicks) * innerH;
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={grid} strokeWidth="0.8"
              strokeDasharray={i === 0 ? "none" : "2 4"} />
            <text x={padL - 8} y={y} textAnchor="end" dominantBaseline="middle"
              fontFamily="var(--mono)" fontSize="9" letterSpacing="1.5" fill={labelCol}>
              {Math.round(v)}
            </text>
          </g>
        );
      })}

      {/* area fill */}
      <path d={areaPath} fill="url(#lineFill)" />

      {/* line */}
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" />

      {/* points */}
      {points.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4"
            fill={dark ? 'var(--ink)' : 'var(--paper-2)'} stroke="var(--accent)" strokeWidth="2" />
        </g>
      ))}

      {/* x labels */}
      {labels.map((lb, i) => (
        <text key={i}
          x={padL + stepX * i}
          y={H - 8}
          textAnchor="middle"
          fontFamily="var(--mono)" fontSize="9" letterSpacing="1.5" fill={labelCol}
        >
          {lb}
        </text>
      ))}

      {/* highlight last point */}
      {(() => {
        const [x, y] = points[points.length - 1];
        return (
          <g>
            <circle cx={x} cy={y} r="9" fill="var(--accent)" fillOpacity="0.18" />
            <text x={x + 12} y={y - 8} fontFamily="Instrument Serif, serif" fontStyle="italic"
              fontSize="20" fill={dark ? 'var(--paper)' : 'var(--ink)'}>
              {values[values.length - 1]}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

// -------- SPARKLINE --------
function Sparkline({ values, w = 100, h = 28, color = 'var(--accent)' }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = w / (values.length - 1);
  const points = values.map((v, i) => {
    const x = stepX * i;
    const y = h - ((v - min) / range) * h * 0.85 - h * 0.075;
    return [x, y];
  });
  const path = points.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ');
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: 'block' }}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}

// -------- MINI PREVIEW (for hub door) --------
function MiniLine({ values, w = 220, h = 100, color = 'currentColor' }) {
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const stepX = w / (values.length - 1);
  const pts = values.map((v, i) => [stepX * i, h - ((v - min) / range) * h * 0.8 - h * 0.1]);
  const path = pts.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.3"
        strokeOpacity="0.5"
        strokeLinejoin="round" strokeLinecap="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 3 : 1.5}
          fill={color} fillOpacity={i === pts.length - 1 ? 1 : 0.5} />
      ))}
    </svg>
  );
}

Object.assign(window, { RadarChart, LineChart, Sparkline, MiniLine });
