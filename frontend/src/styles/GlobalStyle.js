import {createGlobalStyle} from 'styled-components'

export const GlobalStyle = createGlobalStyle`
    *{
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        list-style: none;
    }

    :root{
        /* Palette */
        --color-bg: #0b1020;
        --color-surface: #131a2b;
        --color-surface-2: #0f1626;
        --color-primary: #7c5cff; /* iris */
        --color-primary-600: #6847ff;
        --color-primary-300: #a491ff;
        --color-accent: #28c6f5; /* sky */
        --color-success: #27d17f;
        --color-warning: #ffb020;
        --color-danger: #ff5d5d;
        --color-text: #e6e8ef;
        --color-text-dim: #a6adc9;
        --color-border: #233049;

        /* Typography */
        --font-sans: 'Inter', 'Nunito', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        --font-size-xs: 12px;
        --font-size-sm: 14px;
        --font-size-md: 16px;
        --font-size-lg: 18px;
        --font-size-xl: 22px;
        --font-size-2xl: 28px;
        --font-size-3xl: 34px;

        /* Spacing */
        --space-1: 4px;
        --space-2: 8px;
        --space-3: 12px;
        --space-4: 16px;
        --space-5: 20px;
        --space-6: 24px;
        --space-8: 32px;
        --space-10: 40px;
        --space-12: 48px;

        /* Radius & Shadows */
        --radius-sm: 8px;
        --radius-md: 14px;
        --radius-lg: 20px;
        --shadow-1: 0 6px 24px rgba(0,0,0,0.24), 0 2px 8px rgba(0,0,0,0.2);
        --shadow-glow: 0 0 0 1px rgba(124,92,255,0.35), 0 10px 30px rgba(124,92,255,0.25);

        /* Effects */
        --blur-1: saturate(140%) blur(12px);
        --glass: rgba(255,255,255,0.06);
    }

    body{
        font-family: var(--font-sans);
        font-size: var(--font-size-md);
        color: var(--color-text);
        background:
          radial-gradient(1200px 600px at -10% -10%, rgba(124,92,255,0.20), transparent 55%),
          radial-gradient(900px 500px at 110% 10%, rgba(40,198,245,0.18), transparent 45%),
          linear-gradient(180deg, #0b1020 0%, #0a0f1d 100%);
        min-height: 100vh;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    /* Base elements */
    a { color: var(--color-primary); text-decoration: none; }
    a:hover { color: var(--color-primary-300); }
    img{ max-width: 100%; height: auto; display: block; }

    h1{ font-size: var(--font-size-3xl); line-height: 1.2; font-weight: 800; }
    h2{ font-size: var(--font-size-2xl); line-height: 1.25; font-weight: 700; }
    h3{ font-size: var(--font-size-xl); line-height: 1.3; font-weight: 700; }
    p{ font-size: var(--font-size-md); color: var(--color-text-dim); }

    .container {
        width: min(1200px, 92%);
        margin: 0 auto;
        padding: var(--space-8) 0;
    }

    .surface {
        background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-surface-2) 100%);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-1);
        backdrop-filter: var(--blur-1);
    }

    .elevate {
        transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
    }
    .elevate:hover { transform: translateY(-2px); box-shadow: var(--shadow-glow); border-color: rgba(124,92,255,0.45); }

    /* Buttons */
    .btn { display:inline-flex; align-items:center; gap:10px; background: var(--color-primary); color: #fff; border: 1px solid rgba(255,255,255,0.08); padding: 10px 14px; border-radius: 12px; text-decoration: none; cursor: pointer; box-shadow: var(--shadow-1); font-weight: 600; }
    .btn:hover{ background: var(--color-primary-600); }
    .btn-outline{ background: transparent; color: var(--color-text); border-color: var(--color-border); }
    .btn-outline:hover{ border-color: rgba(124,92,255,0.45); color: var(--color-text); }

    /* Utilities */
    .grid-2 { display:grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .grid-3 { display:grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
    .stack { display:flex; align-items:center; gap: var(--space-3); }
    .stack-wrap { display:flex; flex-wrap: wrap; gap: var(--space-3); }
    .center { display:flex; align-items:center; justify-content:center; }
    .mt-4{ margin-top: var(--space-4); }
    .mt-6{ margin-top: var(--space-6); }
    .mb-4{ margin-bottom: var(--space-4); }
    .mb-6{ margin-bottom: var(--space-6); }
    .w-full{ width:100%; }

    @media (max-width: 900px){
      .grid-2, .grid-3{ grid-template-columns: 1fr; }
      .container{ width: 94%; }
    }
`;