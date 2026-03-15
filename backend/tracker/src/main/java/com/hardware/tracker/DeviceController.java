package com.hardware.tracker;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class DeviceController {

    private List<Device> inventory = new ArrayList<>();
    private List<String> csvHeaders = new ArrayList<>();
    private final String FILE_PATH = "hardware_inventory.csv";

    public DeviceController() {
        // When the server starts, immediately load the data from the Excel/CSV file!
        loadDataFromCSV();
    }

    @GetMapping("/devices")
    public List<Device> getAllDevices() {
        return inventory;
    }

    @DeleteMapping("/inventory")
    public List<Device> clearInventory() {
        inventory.clear();
        csvHeaders.clear();
        
        // Ensure we always have default columns back when cleared
        csvHeaders.add("type");
        csvHeaders.add("brand");
        csvHeaders.add("model");
        csvHeaders.add("department");
        
        saveDataToCSV();
        return inventory;
    }

    @PostMapping("/devices")
    public Device addDevice(@RequestBody Device newDevice) {
        for (String key : newDevice.getProperties().keySet()) {
            if (!csvHeaders.contains(key)) {
                csvHeaders.add(key);
            }
        }
        inventory.add(newDevice);
        saveDataToCSV(); // Auto-update the Excel/CSV file every time!
        return newDevice;
    }

    @PostMapping("/upload")
    public List<Device> uploadCSV(@RequestParam("file") MultipartFile file) {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            inventory.clear(); // Wipe the old memory
            csvHeaders.clear();

            String line = br.readLine();
            if (line == null) {
                return inventory;
            }

            String[] headersArray = line.split(",", -1);
            for (String h : headersArray) {
                csvHeaders.add(h.trim());
            }

            while ((line = br.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }

                String[] data = line.split(",", -1);
                try {
                    Device d = new Device();
                    for (int i = 0; i < data.length && i < csvHeaders.size(); i++) {
                        d.setProperty(csvHeaders.get(i), data[i].trim());
                    }
                    inventory.add(d);
                } catch (Exception e) {
                    System.out.println("Skipped messy row: " + line);
                }
            }

            saveDataToCSV(); // Permanently save the newly uploaded data!
            System.out.println("✅ Successfully uploaded and replaced database!");

        } catch (Exception e) {
            System.out.println("❌ Error processing upload: " + e.getMessage());
        }

        return inventory; // Send the fresh list back to React
    }

    @GetMapping("/headers")
    public List<String> getHeaders() {
        return csvHeaders;
    }

    @PostMapping("/headers")
    public List<String> addHeader(@RequestBody Map<String, String> request) {
        String newHeader = request.get("name");
        if (newHeader != null && !newHeader.trim().isEmpty() && !csvHeaders.contains(newHeader.trim())) {
            csvHeaders.add(newHeader.trim());
            saveDataToCSV();
        }
        return csvHeaders;
    }

    @PutMapping("/headers/rename")
    public List<String> renameHeader(@RequestBody Map<String, String> request) {
        String oldName = request.get("oldName");
        String newName = request.get("newName");

        if (oldName != null && newName != null && !newName.trim().isEmpty() && csvHeaders.contains(oldName)) {
            int index = csvHeaders.indexOf(oldName);
            csvHeaders.set(index, newName.trim());

            for (Device d : inventory) {
                if (d.getProperties().containsKey(oldName)) {
                    Object val = d.getProperties().remove(oldName);
                    d.setProperty(newName.trim(), val);
                }
            }
            saveDataToCSV();
        }
        return csvHeaders;
    }

    @DeleteMapping("/headers/{name}")
    public List<String> deleteHeader(@PathVariable String name) {
        if (name != null) {
            String decodedName = name; // Depending on URL encoding, might need decoding, but let's assume simple names for now
            if (csvHeaders.contains(decodedName)) {
                csvHeaders.remove(decodedName);
                for (Device d : inventory) {
                    d.getProperties().remove(decodedName);
                }
                saveDataToCSV();
            }
        }
        return csvHeaders;
    }

    // --- THE NEW DATABASE ENGINE LOGIC ---

    private void loadDataFromCSV() {
        inventory.clear();
        csvHeaders.clear();
        File file = new File(FILE_PATH);

        if (!file.exists() || file.length() == 0) {
            // Apply default columns if no file or an empty file exists
            csvHeaders.add("type");
            csvHeaders.add("brand");
            csvHeaders.add("model");
            csvHeaders.add("department");
            saveDataToCSV(); // create the initial file right away
            return;
        }

        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line = br.readLine();
            if (line == null || line.trim().isEmpty()) {
                // First line is empty means no headers
                csvHeaders.add("type");
                csvHeaders.add("brand");
                csvHeaders.add("model");
                csvHeaders.add("department");
                saveDataToCSV();
                return;
            }

            // 1. Read the header row
            String[] headersArray = line.split(",", -1);
            for (String h : headersArray) {
                csvHeaders.add(h.trim());
            }

            while ((line = br.readLine()) != null) {
                // 2. Skip completely blank lines from Excel
                if (line.trim().isEmpty()) {
                    continue;
                }

                String[] data = line.split(",", -1);

                // 3. Put a try-catch INSIDE the loop so one bad row doesn't break the whole file!
                try {
                    Device d = new Device();
                    for (int i = 0; i < data.length && i < csvHeaders.size(); i++) {
                        String value = data[i].trim();
                        d.setProperty(csvHeaders.get(i), value);
                    }
                    inventory.add(d);
                } catch (Exception e) {
                    System.out.println("⚠️ Skipped a messy row in Excel: " + line);
                }
            }
        } catch (Exception e) {
            System.out.println("Error reading CSV file completely: " + e.getMessage());
        }
    }

    private void saveDataToCSV() {
        // Collect any new keys just in case
        for (Device d : inventory) {
            for (String key : d.getProperties().keySet()) {
                if (!csvHeaders.contains(key)) {
                    csvHeaders.add(key);
                }
            }
        }

        try (FileWriter writer = new FileWriter(FILE_PATH)) {
            // Write the header
            if (!csvHeaders.isEmpty()) {
                writer.write(String.join(",", csvHeaders) + "\n");
            }

            // Write data
            for (Device d : inventory) {
                List<String> rowValues = new ArrayList<>();
                for (String header : csvHeaders) {
                    Object val = d.getProperties().get(header);
                    // Avoid appending "null", append empty string instead
                    rowValues.add(val != null ? val.toString().replace(",", " ") : "");
                }
                writer.write(String.join(",", rowValues) + "\n");
            }
        } catch (IOException e) {
            System.out.println("Error writing to CSV: " + e.getMessage());
        }
    }
}