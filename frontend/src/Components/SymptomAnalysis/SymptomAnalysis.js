import React, { useState, useContext, useMemo } from "react";
import styled from "styled-components";
import { InnerLayout } from "../../styles/Layouts";
import AIConsult from "./AIConsult";
import { notes } from "../../utils/Icons";
import { FilterContext } from "../../context/FilterContext";
import { AIContext } from "../../context/AIContext";
import symptoms from "../../data/symptoms.json";
import doctorImg from "../../img/doctor.png";

let DiseaseMapping = {
  Psoriasis: "Dermatologist",

  Impetigo: "Dermatologist",

  "Heart Attack": "Cardiologist",

  Hypertension: "Cardiologist",

  Diabetes: "Endocrinologist",

  Hypothyroidism: "Endocrinologist",

  Gastroenteritis: "Gastroenterologist",

  Jaundice: "Gastroenterologist",

  Osteoarthristis: "Rheumatologist",

  "Cervical spondylosis": "Neurologist",

  "(vertigo) Paroymsal  Positional Vertigo": "Neurologist",

  "Bronchial Asthma": "Pulmonologist",
};

function SymptomAnalysis({ updateActive }) {
  const { doctorSpec, setDoctorSpec } = useContext(FilterContext);
  const { nearbyDoctorUrl } = useContext(AIContext);

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [diagnosis, setDiagnosis] = useState("undefined");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSymptoms, setFilteredSymptoms] = useState([]);
  const [consultAI, setConsultAI] = useState(false);
  const [selfCarePrompt, setSelfCarePrompt] = useState("");
  const [showErForm, setShowErForm] = useState(false);
  const [erForm, setErForm] = useState({ name: "", age: "", phone: "", location: "", symptoms: "", notes: "" });

  const triageLevel = useMemo(() => {
    const text = (selectedSymptoms || []).join(" ").toLowerCase().replace(/_/g, " ");
    const emergencyKeywords = ["chest pain", "severe chest", "shortness of breath", "difficulty breathing", "severe bleeding", "unconscious", "stroke", "slurred speech", "one side weak", "seizure", "suicidal", "overdose", "weakness of one body side", "breathlessness"];
    const urgentKeywords = ["high fever", "fever", "persistent vomiting", "dehydration", "severe headache", "stiff neck", "blood in", "fracture", "severe pain"];
    if (emergencyKeywords.some(k => text.includes(k))) return "emergency";
    if (urgentKeywords.some(k => text.includes(k))) return "urgent";
    return "normal";
  }, [selectedSymptoms]);

  // Function to handle selection of symptoms
  const handleSelectSymptom = (symptom) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  // Function to handle removal of selected symptom
  const handleRemoveSymptom = (symptomToRemove) => {
    const updatedSymptoms = selectedSymptoms.filter(
      (symptom) => symptom !== symptomToRemove
    );
    setSelectedSymptoms(updatedSymptoms);
  };

  // Function to handle submission
  const handleSubmit = () => {
    console.log("Selected symptoms:", selectedSymptoms);

    const data = {
      symptoms: selectedSymptoms,
    };

    const url = "https://heal-smart-server.onrender.com/predict";

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Response:", data);
        setDiagnosis(data.prediction);
      })
      .catch((error) => {
        console.error("There was a problem with your fetch operation:", error);
      });

    setSubmitted(true);
  };

  const handleConsultDoctor = () => {
    console.log("diagnosis : ", diagnosis);
    if (diagnosis != "undefined" || diagnosis != undefined) {
      console.log(DiseaseMapping[diagnosis]);
      setDoctorSpec(DiseaseMapping[diagnosis]);
    }
    updateActive(4);
  };
  const handleConsultAI = () => {
    const symText = (selectedSymptoms || []).join(", ").replace(/_/g, " ");
    const prompt = `I have these symptoms: ${symText}. What self-care do you recommend that I can safely try at home? Include do's and don'ts, hydration/rest guidance, OTC options if appropriate with dosing ranges for adults, and warning signs that mean I should stop and see a doctor.`;
    setSelfCarePrompt(prompt);
    setConsultAI(true);
  };

  const submitEmergencyForm = (e) => {
    e.preventDefault();
    const symText = (erForm.symptoms || selectedSymptoms.join(", ")).replace(/_/g, " ");
    const lines = [
      "Emergency Intake",
      "----------------",
      `Name: ${erForm.name}`,
      `Age: ${erForm.age}`,
      `Phone: ${erForm.phone}`,
      `Location: ${erForm.location}`,
      `Symptoms: ${symText}`,
      `Notes: ${erForm.notes}`,
      "",
      "Generated by DocAgent",
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Emergency_Intake_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    alert("Emergency form saved. Please contact local emergency services now.");
    setShowErForm(false);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    const filtered = symptoms.filter((symptom) =>
      symptom.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredSymptoms(filtered);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };


  return (
    <>
      {!submitted && (
        <SymptomAnalysisStyled>
          <div className="heading">
            <h2>Symptom Analysis</h2>
          </div>
          <div className="desc">
            <p>
              Experience instant clarity with our Symptom Analysis feature. Just
              enter your symptoms, and within moments, receive precise
              recommendations and insights tailored to you.{" "}
            </p>
          </div>
          <div className="boxi">
            <SearchBar
              type="text"
              placeholder="Search your symptoms"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
            />
            {searchQuery.length > 1 && (
              <SymptomList>
                {filteredSymptoms.map((symptom, index) => (
                  <SymptomItem
                    key={index}
                    onClick={() => handleSelectSymptom(symptom)}
                  >
                    {symptom}
                  </SymptomItem>
                ))}
              </SymptomList>
            )}
            <SelectedSymptoms>
              {selectedSymptoms.map((symptom, index) => (
                <SelectedSymptom key={index}>
                  {symptom}
                  <RemoveButton onClick={() => handleRemoveSymptom(symptom)}>
                    X
                  </RemoveButton>
                </SelectedSymptom>
              ))}
            </SelectedSymptoms>
            <SubmitButton
              className="bg-purple-500 mt-2 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full"
              onClick={handleSubmit}
            >
              Analyze
            </SubmitButton>
          </div>
        </SymptomAnalysisStyled>
      )}
      {submitted && !consultAI && (
        <Divv>
        <div className="head">
        Analysis report:
      </div>
        <Diagnosis>
          <Dig>
            <img className="banner-img" src={doctorImg} alt="" />
          </Dig>
          <p className={`urgency ${triageLevel}`}>Urgency: {triageLevel === 'emergency' ? 'Emergency 🚨' : triageLevel === 'urgent' ? 'Doctor visit 🩺' : 'Self-care 🏠'}</p>
          <div className="consultation-options">
            <div className="consultation-option">
              <p>Emergency form</p>
              <ConsultDoctorButton onClick={()=>updateActive(5)}>
                Open Emergency Form
              </ConsultDoctorButton>
            </div>
            <div className="consultation-option">
              <p>Self-care advice in chat</p>
              <ConsultAI onClick={handleConsultAI}>
                Ask AI for Self-care
              </ConsultAI>
            </div>
          </div>
          {showErForm && (
            <form className="er-form" onSubmit={submitEmergencyForm}>
              <div className="grid">
                <input required placeholder="Full name" value={erForm.name} onChange={(e)=>setErForm({...erForm, name:e.target.value})} />
                <input required placeholder="Age" value={erForm.age} onChange={(e)=>setErForm({...erForm, age:e.target.value})} />
              </div>
              <div className="grid">
                <input required placeholder="Phone" value={erForm.phone} onChange={(e)=>setErForm({...erForm, phone:e.target.value})} />
                <input placeholder="Location / Address" value={erForm.location} onChange={(e)=>setErForm({...erForm, location:e.target.value})} />
              </div>
              <textarea rows="3" placeholder="Describe the problem / symptoms" value={erForm.symptoms} onChange={(e)=>setErForm({...erForm, symptoms:e.target.value})} />
              <textarea rows="2" placeholder="Other medical info (allergies, meds)" value={erForm.notes} onChange={(e)=>setErForm({...erForm, notes:e.target.value})} />
              <div className="actions">
                <button className="btn" type="submit">Save & proceed</button>
                <button className="btn" type="button" onClick={()=>setShowErForm(false)}>Cancel</button>
              </div>
            </form>
          )}
        </Diagnosis>
        </Divv>
      )}
      {consultAI && (
        <AIConsult
          symptoms={selectedSymptoms}
          diagnosis={diagnosis}
          presetPrompt={selfCarePrompt}
        ></AIConsult>
      )}
    </>
  );
}

const Divv = styled.div`
  .head{
    color: darkviolet;
    font-size: 25px;
    font-weight: 605;
    margin: 50px 40px;
  }
`;


const SymptomAnalysisStyled = styled.div`
  .heading h2 {
    font-size: 29px;
    color: darkviolet;
    font-weight: 605;
    margin: 25px 20px;
    padding: 1rem 1.5rem;
    width: 100%;
  }

  .desc {
    margin: 45px 45px;
    display: flex;
    align-items: center;
    color: #222260;
    font-weight: 400;
    font-size: 20px;
  }
  .boxi{
    margin:50px 50px;
  }
`;

const SearchBar = styled.input`
  padding: 10px;
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
  color: purple;
  background-color: #e6d6fa;
  border: 1.3px solid rgb(168 85 247);
  border-radius: 0.375rem;
`;

const SymptomList = styled.div`
  display: flex;
  justify-content: flex-start;
  align-content: space-around;
  flex-wrap: wrap;
  align-items: center;
`;

const SymptomItem = styled.div`
  cursor: pointer;
  font-size: 15px;
  font-weight: 400;
  border: 1px solid rgb(165 85 247);
  background-color: darkviolet;
  border-radius: 10px;
  padding: 9px;
  color: white;
  margin: 6px;
`;

const SelectedSymptoms = styled.div`
  min-height: 50px;
  margin: 5px;
  margin-top: 20px;
  color: purple;
  border: 1.3px solid rgb(168 85 247);
  display: flex;
  flex-wrap: wrap;
  border-radius: 0.375rem;
  justify-content: flex-start;
  align-content: space-around;
  align-items: center;
`;

const SelectedSymptom = styled.span`
  margin: 5px;
  padding: 5px;
  font-size: 15px;
  font-weight: 400;
  border: 1px solid rgb(165 85 247);
  border-radius: 5px;
`;

const RemoveButton = styled.button`
  margin-left: 5px;
  padding: 3px;
  /* background-color: green; */
  border: none;
  color: darkblue;
  border-radius: 999px;
  cursor: pointer;
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  display: block;
  margin: 50px auto;
`;

const Diagnosis = styled.div`
  margin: 4px 0px;
  text-align: center;
  color: #222260;
  font-weight: 400;
  font-size: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  .consultation-options {
    margin: 60px 25px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
    align-items: stretch;
  }

  .consultation-option {
    flex: 1;
    cursor: pointer;
    display:flex;
    flex-direction: column;
    gap: 8px;
    align-items:center;
  }
`;

const Dig = styled.div`
  padding: 15px;
  color: white;
  border: 1px solid darkviolet;
  border-radius: 5px;
  font-size: 23px;
  // max-width: 10rem;
  background-color: darkviolet;
  margin: 38px auto;
  display:flex;
  align-items:center;
  justify-content:center;
  .banner-img{ width: 100%; max-width: 150px; border-radius: 12px; box-shadow: var(--shadow-1); margin: 0 auto; }
`;

const ConsultDoctorButton = styled.button`
  padding: 10px 20px;
  background-color: #222260;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: white;
    color: darkviolet;
  }
  margin-top: 20px;
  margin-bottom: 20px;
`;

const ConsultAI = styled.button`
  padding: 10px 20px;
  background-color: #222260;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: white;
    color: darkviolet;
  }
  margin-top: 20px;
`;

export default SymptomAnalysis;
