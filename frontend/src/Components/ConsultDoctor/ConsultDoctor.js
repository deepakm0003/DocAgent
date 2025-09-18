import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import { InnerLayout } from "../../styles/Layouts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaStar } from "react-icons/fa";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import doctorsData from "../../data/doctors.json";
import heroImg from "../../img/doctor.png";
import DoctorDetails from "../DoctorDetails/DoctorDetails";
import { FilterContext } from "../../context/FilterContext";

function ConsultDoctor({ updateFilter }) {
  const { doctorSpec, setDoctorSpec } = useContext(FilterContext);

  const [doctors, setDoctors] = useState([]);
  const [filteredItems, setFilteredItems] = useState(doctors);
  const [selectedDoctor, setSelectedDoctor] = useState(doctorSpec);
  const [showDoctorDetails, setShowDoctorDetails] = useState(false);
  const [DoctorDet, setDoctorDet] = useState([]);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [watchId, setWatchId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(40);
  const [locationInput, setLocationInput] = useState("");
  const [mapUrl, setMapUrl] = useState("");

  useEffect(() => {
    // Load from local JSON instead of Firestore
    try {
      setDoctors(doctorsData || []);
    } catch (e) { console.error(e); }
    // Start precise geolocation tracking
    try{
      if (navigator?.geolocation){
        const id = navigator.geolocation.watchPosition((pos)=>{
          setCoords({lat: pos.coords.latitude, lng: pos.coords.longitude});
        }, ()=>{}, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 });
        setWatchId(id);
      }
    }catch(_){ }
  }, []);

  useEffect(()=>{
    return ()=>{
      if (watchId && navigator?.geolocation){
        try{ navigator.geolocation.clearWatch(watchId); }catch(_){ }
      }
    }
  }, [watchId]);

  const notify = (item) => {
    setDoctorDet(item);
    setShowDoctorDetails(true);
  };
  console.log(doctors);
  const filters = [
    "Dermatologist",
    "Endocrinologist",
    "Gastroenterologist",
    "Rheumatologist",
    "Neurologist",
    "Pulmonologist",
    "Cardiologist",
  ];

  const handleFilterChange = (event) => {
    setSelectedDoctor(event.target.value);
  };

  const filterItems = () => {
    const docFiltered = selectedDoctor ? doctors.filter((doctor) => (doctor.specialisation||doctor.speciality) === selectedDoctor) : doctors;
    const loc = (locationQuery || '').toLowerCase();
    const finalFiltered = docFiltered.filter(d => {
      const a = (d.address || '').toLowerCase();
      const n = (d.name || '').toLowerCase();
      const s = (d.speciality || d.specialisation || '').toLowerCase();
      const matchesLoc = loc ? a.includes(loc) || (d.city||'').toLowerCase().includes(loc) : true;
      const matchesQuery = (query||'').trim().length>0 ? (n.includes(query.toLowerCase()) || s.includes(query.toLowerCase())) : true;
      return matchesLoc && matchesQuery;
    });
    setFilteredItems(finalFiltered);
  };

  useEffect(() => {
    filterItems();
  }, [selectedDoctor, doctors]);

  return (
    <>
      {!showDoctorDetails && (
        <DashboardStyled>
          <div className="heading">
            <div className="head-row">
              <h2>Find Doctor</h2>
              <img className="head-art" src={heroImg} alt="" />
            </div>
          </div>
          <InnerLayout>
            <div>
              <h3 className="section-title">Top Doctors</h3>
              <div className="map-block surface elevate">
                <div className="map-head">
                  <div className="title">
                    <img src={heroImg} alt="" />
                    <div>
                      <h4>Find Nearby Doctors</h4>
                      <small>Enter a location or use your current position to see doctors near you.</small>
                    </div>
                  </div>
                  <div className="controls">
                    <input className="w-full" placeholder="Type a location (e.g., Andheri, Delhi)" value={locationInput} onChange={(e)=>setLocationInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); setMapUrl(`https://www.google.com/maps?q=${encodeURIComponent('doctors near '+locationInput)}&output=embed`); } }} />
                    <button className="btn" onClick={()=> setMapUrl(`https://www.google.com/maps?q=${encodeURIComponent('doctors near '+(locationInput||''))}&output=embed`)}>Show on Map</button>
                    <button className="btn btn-outline" onClick={()=>{ if (coords){ setMapUrl(`https://www.google.com/maps?q=${coords.lat},${coords.lng}%20doctors&z=14&output=embed`);} else if (navigator?.geolocation){ navigator.geolocation.getCurrentPosition((pos)=>{ setCoords({lat: pos.coords.latitude, lng: pos.coords.longitude}); setMapUrl(`https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}%20doctors&z=14&output=embed`); }); } }}>Use my location</button>
                  </div>
                </div>
                {mapUrl && (
                  <div className="iframe-wrap">
                    <iframe title="Nearby Doctors" src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                  </div>
                )}
                <div className="chips">
                  {["Cardiologist","Dermatologist","Orthopedics","Psychiatry","Pediatrics","Ophthalmology"].map((c,i)=>(
                    <button key={i} className="chip" onClick={()=>{ setQuery(c); filterItems(); }}>{c}</button>
                  ))}
                </div>
              </div>
              
              

              <div className="cards-grid">
                {filteredItems.slice(0, visibleCount).map((item, idx) => {
                  const randomRating = Math.floor(Math.random() * 5) + 1;
                  return (
                    <div key={`items-${idx}`} className="card surface elevate">
                      <div className="head">
                        <div className="title">
                          <span className="pill">Top Doctor</span>
                          <h3>{item.name}</h3>
                        </div>
                        <div className="rating">
                          {[...Array(randomRating)].map((_, i) => (<FaStar key={`star-${i}`} className="text-yellow-500"/>))}
                          {[...Array(5 - randomRating)].map((_, i) => (<FaStar key={`star-empty-${i}`} className="text-gray-400"/>))}
                        </div>
                      </div>
                      <p className="spec">{item.speciality || item.specialisation}</p>
                      <p className="exp">{item.experience}</p>
                      <p className="addr">{item.address}</p>
                      <p className="time">{item.timings}</p>
                      <div className="actions">
                        {(item.phone || item.mobile || item.mobileNo) && (<a className="btn" href={`tel:${item.phone || item.mobile || item.mobileNo}`}>Call</a>)}
                        {item.email && (<a className="btn btn-outline" href={`mailto:${item.email}`}>Email</a>)}
                        {item.address && (
                          <a className="btn btn-outline" target="_blank" rel="noreferrer"
                             href={`https://www.google.com/maps/dir/?api=1&origin=${coords ? `${coords.lat},${coords.lng}` : ''}&destination=${encodeURIComponent(item.address)}`}>
                            Go to Doctor
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredItems.length > visibleCount && (
                <div className="center mt-4">
                  <button className="btn" onClick={()=>setVisibleCount(c=>c+40)}>See more</button>
                </div>
              )}
            </div>
            <ToastContainer />
          </InnerLayout>
        </DashboardStyled>
      )}
      {showDoctorDetails && <DoctorDetails DoctorDet={DoctorDet} />}
    </>
  );
}

const DashboardStyled = styled.div`
  .heading h2 {
    font-size: 29px;
    color: darkviolet;
    font-weight: 605;
    margin: 25px -17px;
    padding: 1rem 1.5rem;
    width: 100%;
  }
  .head-row{ display:flex; align-items:center; justify-content: space-between; gap: var(--space-4); }
  .head-art{ width: 72px; height:72px; object-fit: contain; margin-right: var(--space-6); opacity:.9; }
  .finder{ padding: 16px; border-radius: var(--radius-lg); margin-bottom: var(--space-6); }
  .finder .row{ display:grid; grid-template-columns: 1fr 1fr auto auto; gap: var(--space-3); }
  .finder input{ padding: 10px 12px; border-radius: 12px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text); }
  .hint{ color: var(--color-text-dim); }
  .map-block{ padding: var(--space-5); border-radius: var(--radius-lg); margin-bottom: var(--space-6); }
  .map-head{ display:grid; grid-template-columns: 1.2fr 1fr; gap: var(--space-4); align-items:center; }
  .map-head .title{ display:flex; align-items:center; gap: var(--space-3); }
  .map-head .title img{ width: 72px; height:72px; object-fit:contain; opacity:.9; }
  .map-head .controls{ display:flex; gap: var(--space-3); }
  .map-head .controls input{ flex:1; padding: 10px 12px; border-radius: 12px; border:1px solid var(--color-border); background: var(--color-surface); color: var(--color-text); }
  .iframe-wrap{ margin-top: var(--space-4); border-radius: 16px; overflow:hidden; border:1px solid var(--color-border); box-shadow: var(--shadow-1); }
  .iframe-wrap iframe{ width:100%; height: 380px; border:0; }
  .chips{ display:flex; flex-wrap:wrap; gap: 8px; margin-top: var(--space-3); }
  .chip{ padding: 8px 10px; border-radius: 999px; border: 1px solid var(--color-border); background: var(--glass); color: var(--color-text); cursor: pointer; }
  .cards-grid{ margin-top: var(--space-6); display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-4); }
  .card{ padding: var(--space-5); border-radius: var(--radius-lg); display:flex; flex-direction: column; gap: 8px; }
  .card .head{ display:flex; align-items:center; justify-content: space-between; }
  .card .title{ display:flex; align-items:center; gap: 10px; }
  .pill{ display:inline-block; padding: 4px 8px; border-radius: 999px; border: 1px solid rgba(124,92,255,0.45); background: rgba(124,92,255,0.12); color: var(--color-primary-300); font-weight: 700; font-size: 12px; }
  .card .spec{ color: var(--color-text-dim); font-weight: 600; }
  .card .addr, .card .time, .card .exp{ color: var(--color-text-dim); }
  .card .actions{ display:flex; gap: var(--space-3); margin-top: var(--space-3); }
  .section-title{ margin-bottom: var(--space-3); }
  @media (max-width: 900px){ .cards-grid{ grid-template-columns: 1fr; } .finder .row{ grid-template-columns: 1fr; } .map-head{ grid-template-columns: 1fr; } }
`;

export default ConsultDoctor;
