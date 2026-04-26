import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const MARQUEE_ITEMS = [
  'Northline Strength', 'Atrium Run Club', 'Pacific Lift Co.',
  'Foundry Athletic', 'Halo Mobility', 'Sixth Street Barbell',
  'Quiet Mile', 'Vertex Climbing', 'Rivermark CrossFit', 'Borough Boxing',
]

const VERTEX_SOURCE = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const FRAGMENT_SOURCE = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_pixelRatio;
  varying vec2 v_uv;
  #define PI 3.14159265359

  mat2 rot(float a) { float s = sin(a); float c = cos(a); return mat2(c, -s, s, c); }

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    mat2 m = mat2(1.58, 1.19, -1.19, 1.58);
    for (int i = 0; i < 6; i++) {
      value += amp * noise(p);
      p = m * p + 11.7;
      amp *= 0.53;
    }
    return value;
  }

  vec2 flowField(vec2 p, float t) {
    vec2 q = p;
    q.x += 0.35 * sin(q.y * 1.9 + t * 0.16);
    q.y += 0.22 * cos(q.x * 1.55 - t * 0.13);
    float n1 = fbm(q * 0.62 + vec2(t * 0.030, -t * 0.018));
    float n2 = fbm(q * 0.84 + vec2(-t * 0.020, t * 0.026));
    float angle = (n1 - 0.5) * 3.8 + (n2 - 0.5) * 2.2;
    return vec2(cos(angle), sin(angle));
  }

  float liquidLayer(vec2 p, float t) {
    vec2 q = p;
    for (int i = 0; i < 7; i++) {
      vec2 f = flowField(q, t);
      q += f * 0.145;
      q *= rot(0.055 * sin(t * 0.045 + float(i)));
    }
    float broad = fbm(q * vec2(1.05, 0.62) + vec2(t * 0.020, -t * 0.016));
    float mid = fbm(q * vec2(2.2, 1.25) + vec2(-t * 0.035, t * 0.024));
    float fine = fbm(q * vec2(5.7, 2.45) + vec2(t * 0.030, t * 0.020));
    float ribbons = sin(q.x * 2.35 + broad * 5.4 + mid * 2.1 + t * 0.09);
    ribbons += 0.72 * sin(q.y * 3.1 - broad * 4.4 + t * 0.07);
    ribbons += 0.35 * sin((q.x + q.y) * 5.1 + fine * 3.1 - t * 0.045);
    return ribbons * 0.5 + 0.5;
  }

  void main() {
    vec2 uv = v_uv;
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float t = u_time * 0.55;
    p.x *= 1.28;
    p.y *= 0.98;

    vec2 warp = vec2(
      fbm(p * 1.1 + vec2(t * 0.018, 5.0)),
      fbm(p * 1.0 + vec2(7.0, -t * 0.015))
    ) - 0.5;
    p += warp * 0.48;
    p *= rot(0.04 * sin(t * 0.07));

    float liquid = liquidLayer(p * 2.25, t);
    float body = smoothstep(0.28, 0.84, liquid);
    float darkBody = smoothstep(0.16, 0.75, liquid);

    float edgeA = smoothstep(0.48, 0.510, liquid) - smoothstep(0.532, 0.570, liquid);
    float edgeB = smoothstep(0.66, 0.692, liquid) - smoothstep(0.720, 0.770, liquid);
    float edgeC = smoothstep(0.32, 0.345, liquid) - smoothstep(0.375, 0.420, liquid);
    float ridges = max(edgeA, 0.0) * 0.74 + max(edgeB, 0.0) * 0.58 + max(edgeC, 0.0) * 0.36;

    vec2 lightDir = normalize(vec2(-0.72, 0.52));
    float slopeX = liquidLayer((p + vec2(0.0035, 0.0)) * 2.25, t) - liquidLayer((p - vec2(0.0035, 0.0)) * 2.25, t);
    float slopeY = liquidLayer((p + vec2(0.0, 0.0035)) * 2.25, t) - liquidLayer((p - vec2(0.0, 0.0035)) * 2.25, t);
    float spec = pow(max(dot(normalize(vec2(slopeX, slopeY)), lightDir), 0.0), 2.25);

    float vignette = smoothstep(1.24, 0.30, length((uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0)));

    float ink = 0.012;
    ink += darkBody * 0.026;
    ink += body * 0.035;
    ink += ridges * 0.44;
    ink += spec * 0.30;

    float largeShadow = fbm(p * 0.68 + vec2(-t * 0.012, t * 0.010));
    ink *= mix(0.48, 1.0, smoothstep(0.18, 0.92, largeShadow));
    ink *= mix(0.68, 1.0, vignette);

    vec3 coldBlack = vec3(0.000, 0.000, 0.004);
    vec3 graphite = vec3(0.035, 0.036, 0.052);
    vec3 steel = vec3(0.17, 0.17, 0.22);
    vec3 highlight = vec3(0.82, 0.82, 0.88);

    vec3 color = coldBlack;
    color = mix(color, graphite, smoothstep(0.018, 0.055, ink));
    color = mix(color, steel, smoothstep(0.070, 0.200, ink));
    color = mix(color, highlight, smoothstep(0.220, 0.430, ink));

    color *= 0.92;
    color = pow(color, vec3(1.06));

    gl_FragColor = vec4(color, 1.0);
  }
`

function formatTime(d) {
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m} ${ap}`
}

export default function Home() {
  const heroCanvasRef = useRef(null)
  const navRef = useRef(null)
  const heroContentRef = useRef(null)
  const heroBottomRef = useRef(null)
  const darkInnerWrapRef = useRef(null)
  const [time, setTime] = useState(() => formatTime(new Date()))

  useEffect(() => {
    document.body.classList.add('home-page')
    return () => document.body.classList.remove('home-page')
  }, [])

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const canvas = heroCanvasRef.current
    if (!canvas) return undefined
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    })
    if (!gl) return undefined

    const compile = (type, source) => {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SOURCE)
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SOURCE)
    if (!vs || !fs) return undefined

    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      return undefined
    }

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )
    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    const timeLocation = gl.getUniformLocation(program, 'u_time')
    const pixelRatioLocation = gl.getUniformLocation(program, 'u_pixelRatio')

    const resizeGL = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2.5)
      const rect = canvas.getBoundingClientRect()
      const displayWidth = Math.floor(rect.width * ratio)
      const displayHeight = Math.floor(rect.height * ratio)
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth
        canvas.height = displayHeight
        gl.viewport(0, 0, canvas.width, canvas.height)
      }
    }
    window.addEventListener('resize', resizeGL)

    let rafId = 0
    const loop = (now) => {
      resizeGL()
      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.uniform1f(timeLocation, now * 0.001)
      gl.uniform1f(pixelRatioLocation, window.devicePixelRatio || 1)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resizeGL)
      gl.deleteBuffer(positionBuffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [])

  useEffect(() => {
    let raf = null
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        const vh = window.innerHeight

        const fade = Math.max(0, 1 - y / (vh * 0.7))
        if (heroContentRef.current) {
          heroContentRef.current.style.opacity = fade
          heroContentRef.current.style.transform = `translate3d(0, ${-y * 0.18}px, 0)`
        }
        if (heroBottomRef.current) {
          heroBottomRef.current.style.opacity = fade
          heroBottomRef.current.style.transform = `translate3d(0, ${y * 0.1}px, 0)`
        }

        if (darkInnerWrapRef.current) {
          const rect = darkInnerWrapRef.current.getBoundingClientRect()
          const trigger = vh * 0.85
          const progress = Math.max(0, Math.min(1, (trigger - rect.top) / (vh * 0.35)))
          darkInnerWrapRef.current.style.opacity = progress
          darkInnerWrapRef.current.style.filter = `blur(${(1 - progress) * 10}px)`
          darkInnerWrapRef.current.style.transform = `translateY(${(1 - progress) * 50}px)`
        }

        if (navRef.current) {
          if (y > vh * 0.85) navRef.current.classList.add('solid')
          else navRef.current.classList.remove('solid')
        }
        raf = null
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="formline-landing">
      <nav className="nav" ref={navRef}>
        <a href="#" className="brand">
          <span className="brand-mark"></span>
          FORMLINE<small>AI Personal Trainer.</small>
        </a>
        <div className="nav-links">
          <a href="#train">Train</a>
          <a href="#track">Track</a>
          <a href="#form">Form</a>
          <a href="#plans">Plans</a>
        </div>
        <div className="nav-right">
          <span className="nav-time">{time}</span>
          <Link to="/login" className="nav-cta">Sign in</Link>
        </div>
      </nav>

      <div className="drift-wrap">
        <section className="hero-transition">
          <div className="sticky-stage">
            <section className="hero">
              <canvas className="hero-bg" ref={heroCanvasRef}></canvas>
              <div className="hero-grain"></div>
              <div className="hero-content" ref={heroContentRef}>
                <div className="eyebrow"><span className="dot"></span>I &nbsp;·&nbsp; AI COACH IN YOUR POCKET</div>
                <h1>Train <em>smarter,</em><br />move <em>better.</em></h1>
                <p className="hero-sub">Formline is your AI personal trainer. It watches your form in real time, maps every workout, and adapts the plan as you grow stronger.</p>
              </div>
              <div className="hero-bottom" ref={heroBottomRef}>
                <div className="hero-tags">
                  <span>FORM TRACKING</span>
                  <span>WORKOUT MAPPING</span>
                  <span>ADAPTIVE PLANS</span>
                  <span>RECOVERY INSIGHTS</span>
                </div>
                <Link to="/login" className="hero-cta">Start free trial <span className="arr">→</span></Link>
              </div>
            </section>
          </div>
        </section>

        <section className="dark-section">
          <div className="dark-bg"></div>
          <div className="dark-inner">
            <div className="dark-inner-wrap" ref={darkInnerWrapRef}>
              <div className="section-eyebrow">II &nbsp;/&nbsp; THE METHOD</div>
              <h2 className="dark-headline">A coach that <em>sees</em> every rep, learns your <em>tempo,</em> and rewrites the plan as you progress.</h2>

              <div className="stats">
                <div className="stat">
                  <div className="stat-num">94<em>%</em></div>
                  <div className="stat-lbl">Form accuracy</div>
                </div>
                <div className="stat">
                  <div className="stat-num">2.4<em>x</em></div>
                  <div className="stat-lbl">Strength gains</div>
                </div>
                <div className="stat">
                  <div className="stat-num">38<em>k</em></div>
                  <div className="stat-lbl">Athletes coached</div>
                </div>
                <div className="stat">
                  <div className="stat-num">12<em>m</em></div>
                  <div className="stat-lbl">Reps analyzed</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="grid-section">
        <div className="grid-inner">
          <div className="grid-head">
            <h2>From a <em>thought</em><br />to a <em>workout</em> plan.</h2>
            <p>Formline turns intention into execution. Tell it your goal — strength, mobility, race day — and it builds, adjusts, and coaches the whole journey.</p>
          </div>

          <div className="grid">
            <div className="card tall">
              <div className="lbl">Form Tracking</div>
              <div className="big">Real-time pose analysis catches breakdown before injury — depth, alignment, tempo, bar path.</div>
              <div className="ring"></div>
            </div>

            <div className="card">
              <div className="lbl">Workout Mapping</div>
              <span className="arr">↗</span>
              <div className="body">Plan every session in one view — sets, reps, RPE, rest. Drag to rearrange, swap exercises in a tap.</div>
            </div>

            <div className="card">
              <div className="lbl">Adaptive Programming</div>
              <span className="arr">↗</span>
              <div className="body">Skipped a session? Travel week? The program rewrites itself so progress doesn't stall.</div>
            </div>

            <div className="card feature">
              <div className="lbl">Live Coaching</div>
              <div className="big">Voice cues during every set — <em>"slow the eccentric, brace, rebrace."</em></div>
            </div>

            <div className="card">
              <div className="lbl">Recovery</div>
              <span className="arr">↗</span>
              <div className="body">Sleep, soreness and HRV feed straight into tomorrow's load. No more guessing deload weeks.</div>
            </div>

            <div className="card">
              <div className="lbl">Mobility & Warm-up</div>
              <span className="arr">↗</span>
              <div className="body">Auto-prescribed ramp-ups built around the lifts you're about to do.</div>
            </div>

            <div className="card">
              <div className="lbl">Progress Maps</div>
              <span className="arr">↗</span>
              <div className="body">Strength curves, range-of-motion deltas and lift-by-lift PRs in one quiet dashboard.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="marquee-section">
        <h3 className="marquee-headline">Built with athletes, coaches and physios across <em>thirty</em> cities.</h3>
        <div className="marquee">
          <div className="marquee-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((name, i) => (
              <span className="marquee-item" key={i}>{name}</span>
            ))}
          </div>
        </div>
        <div className="be-next">
          <span>Train with us</span>
          <span className="arr">→</span>
        </div>
      </section>

      <section className="split-section">
        <div className="split-inner">
          <Link to="/login" className="split-card">
            <div className="visual">FOR · YOU</div>
            <div className="lbl">Athletes</div>
            <div className="title">Start <em>training.</em></div>
          </Link>
          <Link to="/login" className="split-card">
            <div className="visual">FOR · GYMS</div>
            <div className="lbl">Coaches & studios</div>
            <div className="title">Coach at <em>scale.</em></div>
          </Link>
        </div>
      </section>

      <footer className="formline-footer">
        <div className="foot-inner">
          <div className="foot-top">
            Move with <em>intention.</em><br />
            Train with <em>Formline.</em>
          </div>
          <div className="foot-grid">
            <div className="foot-col">
              <h4>Formline</h4>
              <p>An AI personal trainer that sees your form, tracks every rep, and adapts the plan to your life.</p>
            </div>
            <div className="foot-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#">Form Tracking</a></li>
                <li><a href="#">Workout Maps</a></li>
                <li><a href="#">Recovery</a></li>
                <li><a href="#">Plans</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Coaches</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h4>Account</h4>
              <ul>
                <li><Link to="/login">Sign in</Link></li>
                <li><Link to="/login">Create account</Link></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Formline Labs</span>
            <span>Made for movement</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
