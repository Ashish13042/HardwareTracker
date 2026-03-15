package com.hardware.tracker;

import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class DeviceController {

    private List<Device> inventory = new ArrayList<>();
    private final String FILE_PATH = "tracker/hardware_inventory.csv";

    public DeviceController() {
        // When the server starts, immediately load the data from the Excel/CSV file!
        loadDataFromCSV();
    }

    @GetMapping("/devices")
    public List<Device> getAllDevices() {
        return inventory;
    }

    @PostMapping("/devices")
    public Device addDevice(@RequestBody Device newDevice) {
        inventory.add(newDevice);
        saveDataToCSV(); // Auto-update the Excel/CSV file every time!
        return newDevice;
    }

    // --- THE NEW DATABASE ENGINE LOGIC ---

    private void loadDataFromCSV() {
        inventory.clear();
        File file = new File(FILE_PATH);
        
        if (!file.exists()) {
            return; 
        }

        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line;
            boolean isFirstRow = true;
            
            while ((line = br.readLine()) != null) {
                // 1. Skip the header row
                if (isFirstRow) {
                    isFirstRow = false; 
                    continue;
                }
                
                // 2. Skip completely blank lines from Excel
                if (line.trim().isEmpty()) {
                    continue;
                }
                
                String[] data = line.split(",");
                
                // 3. Put a try-catch INSIDE the loop so one bad row doesn't break the whole file!
                try {
                    if (data.length >= 4) {
                        String type = data[0].trim();
                        String brand = data[1].trim();
                        String model = data[2].trim();
                        
                        // 4. THE MAGIC CLEANER: This removes letters (like "GB") so Java only sees numbers
                        String ramText = data[3].replaceAll("[^0-9]", ""); 
                        int ram = Integer.parseInt(ramText);
                        
                        inventory.add(new Device(type, brand, model, ram));
                    }
                } catch (Exception e) {
                    System.out.println("⚠️ Skipped a messy row in Excel: " + line);
                }
            }
        } catch (Exception e) {
            System.out.println("Error reading CSV file completely: " + e.getMessage());
        }
    }

    private void saveDataToCSV() {
        try (FileWriter writer = new FileWriter(FILE_PATH)) {
            writer.write("Type,Brand,Model,RAM\n"); // Write the header
            
            for (Device d : inventory) {
                writer.write(d.getType() + "," + d.getBrand() + "," + d.getModel() + "," + d.getRam() + "\n");
            }
        } catch (IOException e) {
            System.out.println("Error writing to CSV: " + e.getMessage());
        }
    }
}