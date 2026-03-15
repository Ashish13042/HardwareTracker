import { useEffect, useState } from 'react'
import './App.css'

interface Device {
  type: string;
  brand: string;
  model: string;
  ram: number; // FIX: Changed from ramGB to ram to match Java backend exactly
}

function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true); // FIX: Separate loading state
  
  const [type, setType] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [ramInput, setRamInput] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/api/devices')
      .then(response => response.json())
      .then(data => {
        setDevices(data);
        setIsLoading(false); // Done loading, even if the list is empty
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, []);

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    // FIX: Send the payload using the 'ram' property name
    const newDevice = { type, brand, model, ram: parseInt(ramInput) };

    fetch('http://localhost:8080/api/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDevice)
    })
    .then(response => response.json())
    .then(savedDevice => {
      setDevices([...devices, savedDevice]);
      setType(''); setBrand(''); setModel(''); setRamInput('');
    })
    .catch(error => console.error("Error saving device:", error));
  };

  const handleExportCSV = () => {
    let csvContent = "Type,Brand,Model,RAM (GB)\n";
    // FIX: Use device.ram here
    devices.forEach(device => {
      csvContent += `${device.type},${device.brand},${device.model},${device.ram}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "hardware_inventory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container">
      <div className="header-container">
        <h1>IT Hardware Inventory Dashboard</h1>
        <button onClick={handleExportCSV} className="export-btn">⬇️ Export to Excel</button>
      </div>
      
      <form onSubmit={handleAddDevice} className="device-form">
        <input type="text" placeholder="Type (e.g., Switch, Laptop)" value={type} onChange={e => setType(e.target.value)} required />
        <input type="text" placeholder="Brand (e.g., Cisco)" value={brand} onChange={e => setBrand(e.target.value)} required />
        <input type="text" placeholder="Model" value={model} onChange={e => setModel(e.target.value)} required />
        <input type="number" placeholder="RAM (GB)" value={ramInput} onChange={e => setRamInput(e.target.value)} required />
        <button type="submit">Add Device</button>
      </form>

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
            {devices.map((device, index) => (
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
  )
}

export default App;
