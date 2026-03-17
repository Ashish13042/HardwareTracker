# 🛠️ HardwareTracker

A modern, streamlined IT hardware inventory management system built with **Next.js**, **React**, and **TypeScript**. Focus on simplicity, flexibility, and lightning-fast performance.

## ✨ Key Features

- **Dynamic Inventory Management**: Add, rename, or delete columns on the fly to fit your specific hardware tracking needs.
- **CSV-Powered Storage**: Lightweight data management using a local `hardware_inventory.csv` file—no complex database setup required.
- **Instant Search & Filtering**: Real-time filtering by device type, brand, or total text search to find what you need in seconds.
- **CSV Import/Export**: Seamlessly migrate data between the tool and your favorite spreadsheet software.
- **Responsive Design**: A clean, professional UI that handles large inventories with ease.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Data Persistence**: CSV via Node.js File System (FS)
- **Styling**: Vanilla CSS with modern flex/grid layouts

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ashish13042/HardwareTracker.git
   cd HardwareTracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Access the app**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

- `/src/app`: Next.js pages and API routes.
- `/src/lib`: Core logic for CSV parsing and data handling.
- `/public`: Static assets and icons.
- `hardware_inventory.csv`: The local database for your inventory.

## 📖 Usage Tip

To start fresh, you can use the **"Clear All Data"** button in the dashboard, or simply delete the `hardware_inventory.csv` file—the app will recreate a fresh template automatically on the next launch!

---

*Easily track what matters with HardwareTracker.*
