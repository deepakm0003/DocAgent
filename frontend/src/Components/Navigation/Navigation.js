import React from 'react'
import styled from 'styled-components'
import avatar from '../../img/avatar.png'
import { menuItems } from '../../utils/menuItems'
// import { signout } from '../../utils/Icons'

function Navigation({active, setActive}) {
  // allow programmatic navigation from components
  React.useEffect(()=>{
    const handler = (e)=>{ const id = e?.detail?.page; if (typeof id === 'number') setActive(id); };
    window.addEventListener('docagent:navigate', handler);
    return ()=>window.removeEventListener('docagent:navigate', handler);
  }, [setActive]);
  return (
    <NavStyled className="surface elevate">
        <div className="user-con">
            <img src={avatar} alt="loading" />
            <div className="text">
                <p>DocAgent</p>
                <span className="tag">Your AI Health Companion</span>
            </div>
        </div>
        <ul className="menu-items">
            {menuItems.map((item) => {
                return <li 
                    key ={item.id}
                    onClick={() => setActive(item.id)}
                    className={active === item.id ? 'active': ''}
                >
                    <i className="icon">{item.icon}</i>
                    <span>{item.title}</span>
                </li>
            })}
        </ul>
    </NavStyled>
  )
}

const NavStyled = styled.nav`
    padding: var(--space-6) var(--space-8);
    width: 100%;
    height: auto;
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-6);
    position: sticky;
    top: 0;
    z-index: 10;
    .user-con{
        height: auto;
        display: flex;
        align-items: center;
        gap: var(--space-4);
        img{
            width: 56px;
            height: 56px;
            border-radius: 50%;
            object-fit: cover;
            border: 1px solid var(--color-border);
            box-shadow: var(--shadow-1);
        }
        p{
            color: var(--color-text);
            font-weight: 800;
            font-size: var(--font-size-2xl);
        }
        .tag{ display:block; color: var(--color-text-dim); font-size: var(--font-size-sm); margin-top: 2px; }
    }
    .menu-items{
        flex: 1;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: var(--space-2);
        li{
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: max-content;
            align-items: center;
            margin: var(--space-2) 0;
            font-weight: 600;
            cursor: pointer;
            transition: all .25s ease;
            color: var(--color-text-dim);
            padding: 10px 14px;
            border-radius: 12px;
            position: relative;
            border: 1px solid transparent;
        }
        li:hover{ color: var(--color-text); border-color: var(--color-border); background: rgba(255,255,255,0.05); }
        li .icon{ color: var(--color-text-dim); }
    }
    .active{
        color: var(--color-text) !important;
        background: linear-gradient(90deg, rgba(124,92,255,0.18), rgba(40,198,245,0.10));
        border-color: rgba(124,92,255,0.35);
        box-shadow: var(--shadow-glow);
    }
    .bottom-nav{ color: var(--color-text-dim); text-align: center; }
`;

export default Navigation