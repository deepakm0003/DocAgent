import React, { useContext } from 'react'
import styled from 'styled-components'
import { InnerLayout } from '../../styles/Layouts';
import send_icon from '../../img/send_icon.png'
import user_icon from '../../img/user_icon.png'
import gemini_icon from '../../img/gemini_icon.png'
import { Context } from '../../context/Context';

function MentalWellness() {
  const {onSent,recentPrompt,showResult,loading,resultData,setInput,input, openPrintableReport} = useContext(Context)

  return (
    <MentStyled>
      <InnerLayout className='main'>
        <div className='nav'>
          <h2>Mind-Bot</h2>
        </div>
        <div className="main-container">
          {!showResult
          ?<>
            <div className='greet'>
            <p><span>Hi, there!</span></p>
            <p>How are you feeling today?</p>
            </div>
          </>
          :<div className='result surface elevate'>
              <div className='result-title'>
                <img src={user_icon} alt=""/>
                <p>{recentPrompt}</p>
              </div>
              <div className='result-data'>
                <img src={gemini_icon} alt=""></img>
                {loading
                ?<div className='loader'>
                    <hr/>
                    <hr/>
                    <hr/>
                </div>
                :<p dangerouslySetInnerHTML={{__html:resultData}}></p>
                }
              </div>
            </div>
          }
          <div className='main-bottom'>
            <div className='search-box surface elevate'>
              <input onChange={(e)=>setInput(e.target.value)} value={input} type="text" placeholder='Share your thoughts here' onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); onSent(); } }} />
              <div>
                <img onClick={()=>onSent()} src = {send_icon} alt=""/>

              </div>
            </div>
            <div className='center mt-4'>
              <button className='btn btn-outline' onClick={openPrintableReport}>Generate Chat PDF</button>
            </div>
            <p className='bottom-info'>
              Mind-Bot cannot replace professional help. If you need it, it will guide you towards qualified mental health resources.
            </p>
          </div>
        </div>
      </InnerLayout>
    </MentStyled>  
  )
}

const MentStyled = styled.nav`
  .nav h2{
    color: var(--color-primary-300);
    font-size: var(--font-size-2xl);
    font-weight: 700;
    margin: 0 0 var(--space-4) 0;
  }
  .main{
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    min-height: 70vh;
  }

  .main .nav{
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: var(--font-size-xl);
    padding: 0 var(--space-2);
  }

  .main-container{
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    color: var(--color-text);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .main .greet{
    margin: var(--space-6) 0;
    font-size: var(--font-size-3xl);
    color: var(--color-text-dim);
    font-weight: 600;
    padding: 0 var(--space-2);
  }

  .main .greet span{
    background: -webkit-linear-gradient(16deg, #4b90ff, #ff5546);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .result{
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
  }

  .result::-webkit-scrollbar{ display: none; }

  .result-title{
    margin: var(--space-6) 0;
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .result img{ width: 40px; border-radius: 50%; opacity: .9; }

  .result-data{
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .loader{
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .loader hr{
    border-radius: 4px;
    border: none;
    background-color: #f6f7f8;
    background: linear-gradient(to right, #D5A8FF, #f6f7f8, #D5A8FF);
    background-size: 800px 50px;
    height: 20px;
    animation: loader 3s infinite linear;
  }
  @keyframes loader {
    0%{ background-position: -800px 0px; }
    100%{ background-position: 800px 0px; }
  }
  .result-data p{ font-size: 17px; font-weight: 300; line-height: 1.8; }

  .main-bottom{
    margin-top: auto;
    width: 100%;
    max-width: 900px;
    padding: 0 var(--space-2) var(--space-4);
    margin-left: auto;
    margin-right: auto;
  }

  .search-box{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-surface-2) 100%);
    border: 1px solid var(--color-border);
    margin: 0;
    padding: 10px 16px;
    border-radius: 999px;
  }

  .search-box img{ width: 24px; cursor: pointer; }

  .search-box input{
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 9px;
    font-size: 18px;
    color: var(--color-text);
  }

  .search-box input::placeholder { color: var(--color-text-dim); }

  .search-box div{ display: flex; align-items: center; gap: 15px; }

  .main .bottom-info{ font-size: 13px; margin: 10px; text-align: center; color: var(--color-text-dim); }
`;


export default MentalWellness