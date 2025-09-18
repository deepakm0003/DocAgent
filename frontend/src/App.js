import React, { useState } from "react";
import styled from "styled-components";
import bg from "./img/bg.png";
import { MainLayout } from "./styles/Layouts";
import Navigation from "./Components/Navigation/Navigation";
import Home from "./Components/Home/Home";
import MentalWellness from "./Components/MentalWellness/MentalWellness";
import SymptomAnalysis from "./Components/SymptomAnalysis/SymptomAnalysis";
import FindDoctor from "./Components/ConsultDoctor/ConsultDoctor";
import EmergencyForm from "./Components/Emergency/EmergencyForm";
import MindCheck from "./Components/MindCheck/MindCheck";
import HealthCoach from "./Components/HealthCoach/HealthCoach";
import HealthCoachBot from "./Components/HealthCoach/HealthCoachBot";
import HealthCoachSuite from "./Components/HealthCoach/HealthCoachSuite";
// import ConsultDoctor from "./Components/ConsultDoctor/ConsultDoctor";
import "./index.css";
import { GlobalStyle } from "./styles/GlobalStyle";

function App() {
  const [active, setActive] = useState(1);
  const [fil, setFil] = useState([]);
  const updateActive = (activeState) => {
    setActive(activeState);
  };

  const updateFilter = (fils) => {};

  const displayData = () => {
    switch (active) {
      case 1:
        return <Home updateActive={updateActive} />;
      case 2:
        return <SymptomAnalysis updateActive={updateActive} />;
      case 3:
        return <MentalWellness updateActive={updateActive} />;
      case 4:
        return <FindDoctor updateActive={updateActive} />;
      case 5:
        return <EmergencyForm />;
      case 6:
        return <MindCheck />;
      case 7:
        return <HealthCoach />;
      case 8:
        return <HealthCoachBot />;
      case 9:
        return <HealthCoachSuite />;
      default:
        return <Home />;
    }
  };

  return (
    <AppStyled bg={bg} className="App">
      <GlobalStyle />
      <MainLayout>
        <Navigation active={active} setActive={(id)=>{ setActive(id); }} />
        <main className="surface elevate container">{displayData()}</main>
      </MainLayout>
    </AppStyled>
  );
}

const AppStyled = styled.div`
  min-height: 100vh;
  position: relative;
  main {
    flex: 1;
    border-radius: var(--radius-lg);
    overflow-x: hidden;
    &::-webkit-scrollbar {
      width: 0;
    }
  }
`;

export default App;
