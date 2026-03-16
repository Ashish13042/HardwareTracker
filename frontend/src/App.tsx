import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [devices, setDevices] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [newColumnName, setNewColumnName] = useState("");

  // Header Editing State
  const [editingHeader, setEditingHeader] = useState<string | null>(null);
  const [editHeaderValue, setEditHeaderValue] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterBrand, setFilterBrand] = useState("All");

  const fetchData = () => {
    setIsLoading(true);
    // Fetch headers first, then devices to ensure UI stays in sync
    Promise.all([
      fetch("http://localhost:8080/api/headers").then(res => {
        if (!res.ok) throw new Error("Headers API failed");
        return res.json();
      }),
      fetch("http://localhost:8080/api/devices").then(res => {
        if (!res.ok) throw new Error("Devices API failed");
        return res.json();
      })
    ])
    .then(([fetchedHeaders, fetchedDevices]) => {
      setHeaders(fetchedHeaders);
      setDevices(fetchedDevices);
      setIsLoading(false);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (header: string, value: string) => {
    setFormData(prev => ({ ...prev, [header]: value }));
  };

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add missing form fields as empty strings just in case
    const payload = { ...formData };
    headers.forEach(h => {
      if (!payload[h]) payload[h] = "";
    });

    fetch("http://localhost:8080/api/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then(() => {
        fetchData(); // Refresh all
        setFormData({}); // Clear form
      })
      .catch((error) => console.error("Error saving device:", error));
  };

  const handleExportCSV = () => {
    let csvContent = headers.join(",") + "\n";
    devices.forEach((device) => {
      const row = headers.map(h => {
        const val = device[h];
        return val !== undefined && val !== null ? val : "";
      });
      csvContent += row.join(",") + "\n";
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

    // --- THE MAGIC FIX ---
    // Instantly wipe the browser's memory of the file name
    // so it allows you to upload the exact same file again later!
    e.target.value = '';

    const uploadData = new FormData();
    uploadData.append("file", file);

    fetch("http://localhost:8080/api/upload", {
      method: "POST",
      body: uploadData,
    })
      .then(() => {
        fetchData();
        alert("✅ Database successfully overwritten with new file!");
      })
      .catch((error) => console.error("Error uploading file:", error));
  };

  // --- Header Management ---
  const handleAddColumn = () => {
    if (!newColumnName.trim() || headers.includes(newColumnName.trim())) return;
    
    fetch("http://localhost:8080/api/headers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newColumnName.trim() })
    })
      .then(res => res.json())
      .then(newHeaders => {
        setHeaders(newHeaders);
        setNewColumnName("");
      })
      .catch(err => console.error(err));
  };

  const startEditingHeader = (header: string) => {
    setEditingHeader(header);
    setEditHeaderValue(header);
  };

  const cancelEditingHeader = () => {
    setEditingHeader(null);
    setEditHeaderValue("");
  };

  const saveEditedHeader = (oldName: string) => {
    if (!editHeaderValue.trim() || editHeaderValue === oldName) {
      cancelEditingHeader();
      return;
    }

    fetch("http://localhost:8080/api/headers/rename", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldName, newName: editHeaderValue.trim() })
    })
      .then(() => {
        fetchData();
        cancelEditingHeader();
      })
      .catch(err => console.error(err));
  };

  const handleDeleteColumn = (name: string) => {
    if (!window.confirm(`Are you sure you want to delete the column "${name}"? This removes the data from all devices!`)) return;

    fetch(`http://localhost:8080/api/headers/${encodeURIComponent(name)}`, {
      method: "DELETE"
    })
      .then(() => fetchData())
      .catch(err => console.error(err));
  };

  const handleClearInventory = () => {
    if (!window.confirm("⚠️ WARNING: Are you sure you want to completely delete ALL hardware data and columns? This cannot be undone!")) return;

    fetch("http://localhost:8080/api/inventory", {
      method: "DELETE"
    })
      .then(() => fetchData())
      .catch(err => console.error(err));
  };

  // Find the exact keys for type and brand (case insensitive)
  const typeKey = headers.find(h => h.toLowerCase() === "type");
  const brandKey = headers.find(h => h.toLowerCase() === "brand");

  const uniqueTypes = typeKey 
    ? ['All', ...Array.from(new Set(devices.filter(d => d[typeKey]).map(d => d[typeKey])))] 
    : ['All'];
  
  // Only show brands that match the currently selected type filter
  const validDevicesForType = filterType === 'All' || !typeKey ? devices : devices.filter(d => d[typeKey] === filterType);
  
  const uniqueBrands = brandKey 
    ? ['All', ...Array.from(new Set(validDevicesForType.filter(d => d[brandKey]).map(d => d[brandKey])))] 
    : ['All'];

  const filteredDevices = devices.filter(device => {
    // 1. Text Search Match
    let matchesSearch = true;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      matchesSearch = headers.some(header => {
        const val = device[header];
        if (val === undefined || val === null) return false;
        return val.toString().toLowerCase().includes(searchLower);
      });
    }

    // 2. Type Match
    const matchesType = filterType === 'All' || (typeKey && device[typeKey] === filterType);
    
    // 3. Brand Match
    const matchesBrand = filterBrand === 'All' || (brandKey && device[brandKey] === filterBrand);

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

      {/* Dynamic Form Card */}
      <div className="card form-card">
        <h2>Add New Device</h2>
        <form onSubmit={handleAddDevice} className="device-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {headers.map(header => (
            <div className="input-group" key={`form-${header}`}>
              <label className="input-label" style={{ textTransform: 'capitalize' }}>{header}</label>
              <input
                type="text"
                placeholder={`Enter ${header}`}
                className="form-input"
                value={formData[header] || ""}
                onChange={(e) => handleInputChange(header, e.target.value)}
              />
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gridColumn: '1 / -1', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ height: "46px" }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Add Device
            </button>
          </div>
        </form>
      </div>

      {/* Table Card */}
      <div className="card table-card">
        <div className="table-header">
          <div className="table-header-top" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
            <h2>Inventory List</h2>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="New Column Name" 
                value={newColumnName}
                onChange={e => setNewColumnName(e.target.value)}
                style={{ width: '180px' }}
              />
              <button className="btn btn-secondary" onClick={handleAddColumn}>+ Add Column</button>
              {devices.length > 0 && (
                <button 
                  onClick={handleClearInventory} 
                  style={{ 
                    backgroundColor: '#ef4444', 
                    color: 'white', 
                    border: 'none', 
                    padding: '8px 16px', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  ⛌ Clear All Data
                </button>
              )}
            </div>
          </div>
          
          <div className="controls-container" style={{ marginTop: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-bar" style={{ flex: '1 1 200px', minWidth: '200px' }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search across all fields..."
                className="form-input"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Dynamic Type Filter */}
            {typeKey && (
              <div className="filter-group" style={{ flex: '0 1 180px' }}>
                <select
                  value={filterType}
                  className="form-input"
                  onChange={e => {
                    setFilterType(e.target.value);
                    setFilterBrand('All'); // Reset brand when type changes
                  }}
                >
                  {uniqueTypes.map(t => (
                    <option key={`type-${t}`} value={t}>{t === 'All' ? 'All Types' : t}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Dynamic Brand Filter */}
            {brandKey && (
              <div className="filter-group" style={{ flex: '0 1 180px' }}>
                <select
                  value={filterBrand}
                  className="form-input"
                  onChange={e => setFilterBrand(e.target.value)}
                >
                  {uniqueBrands.map(b => (
                    <option key={`brand-${b}`} value={b}>{b === 'All' ? 'All Brands' : b}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="state-message">
            <span className="emoji">⏳</span>
            Loading devices from server...
          </div>
        ) : headers.length === 0 ? (
          <div className="state-message">
            <span className="emoji">📦</span>
            No columns defined. Add a column to start tracking inventory!
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <table className="device-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  {headers.map(header => (
                    <th key={`th-${header}`} style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', background: '#f9fafb', whiteSpace: 'nowrap' }}>
                      {editingHeader === header ? (
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <input 
                            className="form-input" 
                            style={{ padding: '4px 8px', width: '120px' }} 
                            value={editHeaderValue}
                            onChange={(e) => setEditHeaderValue(e.target.value)}
                            autoFocus
                          />
                          <button onClick={() => saveEditedHeader(header)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#10b981' }}>✅</button>
                          <button onClick={cancelEditingHeader} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>❌</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <span style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: '600', color: '#6b7280', letterSpacing: '0.05em' }}>{header}</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => startEditingHeader(header)} title="Rename Column" style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.6, padding: '2px' }}>✏️</button>
                            <button onClick={() => handleDeleteColumn(header)} title="Delete Column" style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.6, padding: '2px' }}>🗑️</button>
                          </div>
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map((device, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    {headers.map(header => (
                      <td key={`td-${index}-${header}`} style={{ padding: '12px' }}>
                        {device[header] || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>N/A</span>}
                      </td>
                    ))}
                  </tr>
                ))}

                {filteredDevices.length === 0 && devices.length > 0 && (
                  <tr>
                    <td colSpan={headers.length}>
                      <div className="state-message" style={{ padding: '20px', textAlign: 'center' }}>
                        No results match your search.
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