import javax.swing.*;
import java.awt.*;
import java.util.ArrayList;
import java.io.FileWriter;
import java.io.IOException;

public class GuiMain {
    public static void main(String[] args) {
        
        // 1. We still need our inventory list to hold the data in memory!
        ArrayList<Device> inventory = new ArrayList<>();

        JFrame frame = new JFrame("Hardware Inventory Tracker");
        frame.setSize(400, 350); // Made it slightly taller to fit the new button
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        
        JPanel panel = new JPanel();
        panel.setLayout(new GridLayout(6, 2, 10, 10)); // Changed to 6 rows
        
        JLabel typeLabel = new JLabel(" Device Type (e.g., Laptop):");
        JLabel brandLabel = new JLabel(" Brand (e.g., Dell):");
        JLabel modelLabel = new JLabel(" Model (e.g., XPS 15):");
        JLabel ramLabel = new JLabel(" RAM Capacity (GB):");
        
        JTextField typeField = new JTextField();
        JTextField brandField = new JTextField();
        JTextField modelField = new JTextField();
        JTextField ramField = new JTextField();
        
        JButton addButton = new JButton("Add Device");
        JButton exportButton = new JButton("Export to Excel (CSV)"); // New Button!
        
        panel.add(typeLabel);
        panel.add(typeField);
        panel.add(brandLabel);
        panel.add(brandField);
        panel.add(modelLabel);
        panel.add(modelField);
        panel.add(ramLabel);
        panel.add(ramField);
        
        panel.add(new JLabel("")); 
        panel.add(addButton);      
        
        panel.add(new JLabel("")); // Leave bottom-left empty again
        panel.add(exportButton);   // Put the export button in the bottom-right
        
        // --- THE MAGIC: ACTION LISTENERS ---

        // 1. What happens when you click "Add Device"?
        addButton.addActionListener(e -> {
            try {
                // Grab the text from the boxes
                String type = typeField.getText();
                String brand = brandField.getText();
                String model = modelField.getText();
                int ram = Integer.parseInt(ramField.getText()); // Convert text to number

                // Build the device and add it to the list
                Device newDevice = new Device(type, brand, model, ram);
                inventory.add(newDevice);

                // Show a success pop-up!
                JOptionPane.showMessageDialog(frame, "✅ Added " + brand + " " + model + " to inventory!");

                // Clear the boxes so they are empty for the next entry
                typeField.setText("");
                brandField.setText("");
                modelField.setText("");
                ramField.setText("");

            } catch (NumberFormatException ex) {
                // If they type "six" instead of "6" for RAM, show an error pop-up
                JOptionPane.showMessageDialog(frame, "❌ Error: RAM must be a number!", "Input Error", JOptionPane.ERROR_MESSAGE);
            }
        });

        // 2. What happens when you click "Export to Excel"?
        exportButton.addActionListener(e -> {
            try {
                FileWriter writer = new FileWriter("hardware_inventory.csv");
                writer.write("Type,Brand,Model,RAM_GB\n");
                
                for (int i = 0; i < inventory.size(); i++) {
                    Device d = inventory.get(i);
                    writer.write(d.getType() + "," + d.getBrand() + "," + d.getModel() + "," + d.getRam() + "\n");
                }
                
                writer.close();
                // Show a success pop-up!
                JOptionPane.showMessageDialog(frame, "✅ Data exported to hardware_inventory.csv successfully!");
                
            } catch (IOException ex) {
                JOptionPane.showMessageDialog(frame, "❌ Error: Could not save the file.", "Save Error", JOptionPane.ERROR_MESSAGE);
            }
        });

        frame.add(panel);
        frame.setVisible(true);
    }
}