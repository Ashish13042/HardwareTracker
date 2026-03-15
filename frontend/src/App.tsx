import { useEffect, useState } from "react";
import "./App.css";

interface Device {
  type: string;
  brand: string;
  model: string;
  ram: number;
}

function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, []);

  const uniqueTypes = ['All', ...Array.from(new Set(devices.map(d => d.type)))];
  const validDevicesForType = filterType === 'All' ? devices : devices.filter(d => d.type === filterType);
  const uniqueBrands = ['All', ...Array.from(new Set(validDevicesForType.map(d => d.brand)))];

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
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

  const filteredDevices = devices.filter(device => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      device.type.toLowerCase().includes(searchLower) ||
      device.brand.toLowerCase().includes(searchLower) ||
      device.model.toLowerCase().includes(searchLower) ||
      device.ram.toString().includes(searchLower);

    const matchesType = filterType === 'All' || device.type === filterType;
    const matchesBrand = filterBrand === 'All' || device.brand === filterBrand;

    return matchesSearch && matchesType && matchesBrand;
  });

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header-container">
        <div className="header-title-group">
          <h1>Hardware Tracker</h1>
          <p>Manage and monitor your enterprise IT hardware inventory</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <label className="btn btn-secondary">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            Upload CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </label>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Export
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className="card form-card">
        <h2>Add New Device</h2>
        <form onSubmit={handleAddDevice} className="device-form">
          <div className="input-group">
            <label className="input-label">Type</label>
            <input
              type="text"
              placeholder="e.g. Laptop, Switch"
              className="form-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Brand</label>
            <input
              type="text"
              placeholder="e.g. Cisco, Apple"
              className="form-input"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Model</label>
            <input
              type="text"
              placeholder="e.g. Catalyst 9300"
              className="form-input"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">RAM (GB)</label>
            <input
              type="number"
              placeholder="e.g. 16"
              className="form-input"
              value={ramInput}
              onChange={(e) => setRamInput(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: "46px" }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add Device
          </button>
        </form>
      </div>

      {/* Table Card */}
      <div className="card table-card">
        <div className="table-header">
          <div className="table-header-top">
            <h2>Inventory List</h2>
          </div>
          <div className="controls-container">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search inventory..." 
                className="form-input"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <select 
                value={filterType} 
                className="form-input"
                onChange={e => {
                  setFilterType(e.target.value);
                  setFilterBrand('All');
                }}
              >
                {uniqueTypes.map(t => (
                  <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select 
                value={filterBrand} 
                className="form-input"
                onChange={e => setFilterBrand(e.target.value)}
              >
                {uniqueBrands.map(b => (
                  <option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="state-message">
            <span className="emoji">⏳</span>
            Loading devices from server...
          </div>
        ) : devices.length === 0 ? (
          <div className="state-message">
            <span className="emoji">📦</span>
            No devices found in inventory.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="device-table">
              <thead>
                <tr>
                  <th>Device Type</th>
                  <th>Brand</th>
                  <th>Model Name</th>
                  <th>RAM (GB)</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map((device, index) => (
                  <tr key={index}>
                    <td><strong>{device.type}</strong></td>
                    <td><span className="brand-badge">{device.brand}</span></td>
                    <td>{device.model}</td>
                    <td>{device.ram} GB</td>
                  </tr>
                ))}
                {filteredDevices.length === 0 && devices.length > 0 && (
                  <tr>
                    <td colSpan={4}>
                      <div className="state-message" style={{ padding: '20px' }}>
                        No results match your filters.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
