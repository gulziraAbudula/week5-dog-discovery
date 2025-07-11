import React, { useState } from "react";
import "./App.css";

const DOG_API_URL = "https://api.thedogapi.com/v1/images/search?has_breeds=true";

const App = () => {
  const [currentDog, setCurrentDog] = useState(null);
  const [banList, setBanList] = useState([]);

  const fetchDog = async () => {
    console.log("Fetching dog...");
    for (let i = 0; i < 10; i++) {
      try {
        const res = await fetch(DOG_API_URL, {
          headers: {
            "x-api-key": import.meta.env.VITE_DOG_API_KEY,
          },
        });

        if (!res.ok) {
          throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log("API Response:", data);

        // Defensive check for empty or invalid data
        if (!Array.isArray(data) || data.length === 0) {
          console.warn("API returned empty array.");
          continue;
        }

        const dog = data[0];

        // Handle dogs without breed info
        if (!dog?.breeds?.length) {
          console.warn("Dog has no breed info, using default values:", dog);
          setCurrentDog({
            image: dog.url,
            name: "Unknown Breed",
            origin: "Unknown Origin",
            weight: "Unknown Weight",
          });
          return; // Exit the loop after setting the state
        }

        // Extract breed information
        const breed = dog.breeds[0];
        const name = breed.name || "Unknown";
        const origin = breed.origin || "Unknown";
        const weight = breed.weight.metric || "Unknown";

        // Check if the dog matches the ban list
        if (
          banList.includes(name) ||
          banList.includes(origin) ||
          banList.includes(weight)
        ) {
          console.warn("Dog matches ban list, skipping:", dog);
          continue;
        }

        // Update the currentDog state with valid data
        setCurrentDog({
          image: dog.url,
          name,
          origin,
          weight,
        });
        return; // Exit the loop after successfully setting the state
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    }

    alert("Could not find a dog with breed info not on the ban list.");
  };

  const handleBan = (value) => {
    if (!banList.includes(value)) {
      setBanList([...banList, value]);
    }
  };

  const handleUnban = (value) => {
    setBanList(banList.filter((item) => item !== value));
  };

  return (
    <div className="app">
      <h1>Dog Discoverer 🐶</h1>
      <button onClick={fetchDog}>Discover!</button>

      {currentDog && (
        <div className="dog-card">
          <h2>{currentDog.name}</h2>
          <div className="attributes">
            <button onClick={() => handleBan(currentDog.name)}>{currentDog.name}</button>
            <button onClick={() => handleBan(currentDog.origin)}>{currentDog.origin}</button>
            <button onClick={() => handleBan(currentDog.weight)}>{currentDog.weight} kg</button>
          </div>
          <img src={currentDog.image} alt={currentDog.name} />
        </div>
      )}

      <div className="ban-list">
        <h3>Ban List</h3>
        {banList.length === 0 ? (
          <p>No banned attributes</p>
        ) : (
          banList.map((item) => (
            <button key={item} onClick={() => handleUnban(item)}>{item}</button>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
