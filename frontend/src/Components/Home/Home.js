import React, { useState } from 'react'
import styled from 'styled-components'
import { InnerLayout } from '../../styles/Layouts';
import SymptomAnalysis from '../SymptomAnalysis/SymptomAnalysis';
import MentalWellness from '../MentalWellness/MentalWellness';
import hero from '../../img/hero.png'

function Home({ updateActive }) {
  const [selectedComponent, setSelectedComponent] = useState(null);

  const handleComponentClick = (component) => {
    setSelectedComponent(component);
  };

  const renderSelectedComponent = () => {
    switch (selectedComponent) {
      case "SymptomAnalysis":
        updateActive(2);
        return;
      case "MentalWellness":
        updateActive(3);
        return;
      case "ConsultDoctor":
        return;
      default:
        updateActive(1);
        return;
    }
  };

  return (
    <HomeStyled>
      {!selectedComponent ? (
        <>
        <HeroSection className="container">
          <div className='hero surface elevate'>
            <div className='col text'>
              <span className='badge'>Your AI Health Companion</span>
              <h1>Take charge of your health, mind & body</h1>
              <p>Describe your symptoms and get smart triage, self‑care guidance, and nearby doctor options. For mental wellness, chat with our Mind‑Bot.</p>
              <div className='cta'>
                <button className='btn' onClick={() => handleComponentClick('SymptomAnalysis')}>Start Symptom Analysis</button>
                <button className='btn btn-outline' onClick={() => handleComponentClick('MentalWellness')}>Try Mind‑Bot</button>
              </div>
            </div>
            <div className='col art'>
              <img src={hero} alt='DocAgent illustration'></img>
            </div>
          </div>
        </HeroSection>
        <CardContainer className="container">
          <Card className='surface elevate' onClick={() => handleComponentClick('SymptomAnalysis')}>
            <h2>Symptom Analysis</h2>
            <p>AI-powered triage: emergency, doctor visit, or self-care.</p>
            <div className='actions'><span className='chip'>Health</span><span className='chip'>AI</span></div>
          </Card>
          <Card className='surface elevate' onClick={() => handleComponentClick('MentalWellness')}>
            <h2>Mind‑Bot</h2>
            <p>Your companion for mindfulness tips and supportive chat.</p>
            <div className='actions'><span className='chip'>Wellness</span><span className='chip'>Support</span></div>
          </Card>
        </CardContainer>
        </>
      ) : (
        renderSelectedComponent()
      )}
    </HomeStyled>
  );
}

const HomeStyled = styled.div``;

const HeroSection = styled.div`
  .hero{
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: var(--space-8);
    padding: var(--space-8);
    border-radius: var(--radius-lg);
  }
  .badge{ display:inline-block; background: rgba(124,92,255,0.15); color: var(--color-primary-300); padding: 6px 10px; border-radius: 999px; border: 1px solid rgba(124,92,255,0.35); font-weight: 700; margin-bottom: var(--space-3); }
  .text h1{ font-size: clamp(28px, 4vw, 44px); color: var(--color-text); margin-bottom: var(--space-3); }
  .text p{ color: var(--color-text-dim); margin-bottom: var(--space-4); }
  .cta{ display:flex; gap: var(--space-3); flex-wrap: wrap; }
  .art img{ width: 100%; max-width: 420px; margin-left: auto; }
  @media (max-width: 900px){ .hero{ grid-template-columns: 1fr; } .art img{ margin: 0 auto; } }
`;

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-6);
  margin-top: var(--space-10);
`;

const Card = styled.div`
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  transition: all .25s ease;
  cursor: pointer;
  h2{ margin-bottom: var(--space-2); }
  p{ color: var(--color-text-dim); }
  .actions{ margin-top: var(--space-4); display:flex; gap: var(--space-2); }
  .chip{ display:inline-block; padding: 6px 10px; border-radius: 999px; background: var(--glass); border: 1px solid var(--color-border); }
`;

export default Home;
