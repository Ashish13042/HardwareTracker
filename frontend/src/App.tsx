import { useEffect, useState } from "react";
import "./App.css";

interface Device {
  type: string;
  brand: string;
  model: string;
  ram: number; // FIX: Changed from ramGB to ram to match Java backend exactly
}

function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true); // FIX: Separate loading state

  const [type, setType] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [ramInput, setRamInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterBrand, setFilterBrand] = useState("All");

  useEffect(() => {
    fetch("http://localhost:8080/api/devices")
      .then((response) => response.json())
      .then((data) => {
        setDevices(data);
        setIsLoading(false); // Done loading, even if the list is empty
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, []);
 // Extract unique types for the first dropdown
  const uniqueTypes = ['All', ...Array.from(new Set(devices.map(d => d.type)))];

  // THE SMART BRAND LIST: First, filter the devices by the selected Type. 
  // Then, extract the brands ONLY from those specific devices!
  const validDevicesForType = filterType === 'All' ? devices : devices.filter(d => d.type === filterType);
  const uniqueBrands = ['All', ...Array.from(new Set(validDevicesForType.map(d => d.brand)))];

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    // FIX: Send the payload using the 'ram' property name
    const newDevice = { type, brand, model, ram: parseInt(ramInput) };

    fetch("http://localhost:8080/api/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDevice),
    })
      .then((response) => response.json())
      .then((savedDevice) => {
        setDevices([...devices, savedDevice]);
        setType("");
        setBrand("");
        setModel("");
        setRamInput("");
      })
      .catch((error) => console.error("Error saving device:", error));
  };

  const handleExportCSV = () => {
    let csvContent = "Type,Brand,Model,RAM (GB)\n";
    // FIX: Use device.ram here
    devices.forEach((device) => {
      csvContent += `${device.type},${device.brand},${device.model},${device.ram}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "hardware_inventory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    fetch("http://localhost:8080/api/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((newData) => {
        setDevices(newData);
        alert("✅ Database successfully overwritten with new file!");
      })
      .catch((error) => console.error("Error uploading file:", error));
  };
  // THE INSTANT SEARCH LOGIC
  // THE UPGRADED MULTI-FILTER LOGIC
const filteredDevices = devices.filter(device => {
  // 1. Check the text search
  const searchLower = searchTerm.toLowerCase();
  const matchesSearch = 
    device.type.toLowerCase().includes(searchLower) ||
    device.brand.toLowerCase().includes(searchLower) ||
    device.model.toLowerCase().includes(searchLower) ||
    device.ram.toString().includes(searchLower);

  // 2. Check the dropdowns
  const matchesType = filterType === 'All' || device.type === filterType;
  const matchesBrand = filterBrand === 'All' || device.brand === filterBrand;

  // 3. Only show the row if it passes all tests!
  return matchesSearch && matchesType && matchesBrand;
});

  return (
    <div className="app-container">
      <div className="header-container">
        <h1>IT Hardware Inventory Dashboard</h1>

        <div className="button-group">
          {/* THE NEW DRAG & DROP UPLOAD BUTTON */}
          <label className="upload-btn">
            ⬆️ Upload CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </label>

          <button onClick={handleExportCSV} className="export-btn">
            ⬇️ Export to Excel
          </button>
        </div>
      </div>

      <form onSubmit={handleAddDevice} className="device-form">
        <input
          type="text"
          placeholder="Type (e.g., Switch, Laptop)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Brand (e.g., Cisco)"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="RAM (GB)"
          value={ramInput}
          onChange={(e) => setRamInput(e.target.value)}
          required
        />
        <button type="submit">Add Device</button>
      </form>
      {/* SEARCH AND FILTER BAR */}
      <div className="search-filter-container">
        <input 
          type="text" 
          placeholder="🔍 Search inventory..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select 
          value={filterType} 
          onChange={e => {
            setFilterType(e.target.value); // Update the Type
            setFilterBrand('All');         // Instantly reset the Brand!
          }}
          className="filter-dropdown"
        >
          {uniqueTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select 
          value={filterBrand} 
          onChange={e => setFilterBrand(e.target.value)}
          className="filter-dropdown"
        >
          {uniqueBrands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      {/* FIX: Check the actual loading state, not just array length */}
      {isLoading ? (
        <p>Loading devices from Java server...</p>
      ) : devices.length === 0 ? (
        <p>No devices found. Add one above!</p>
      ) : (
        <table className="device-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Brand</th>
              <th>Model</th>
              <th>RAM (GB)</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((device, index) => (
              <tr key={index}>
                <td>{device.type}</td>
                <td>{device.brand}</td>
                <td>{device.model}</td>
                {/* FIX: Display device.ram */}
                <td>{device.ram}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
