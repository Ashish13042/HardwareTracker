import java.util.Scanner;
import java.util.ArrayList;
import java.io.FileWriter;
import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        ArrayList<Device> inventory = new ArrayList<>();
        boolean isRunning = true;

        while (isRunning) {
            System.out.println("\n--- Main Menu ---");
            System.out.println("1. Add a new device");
            System.out.println("2. View all devices");
            System.out.println("3. Export to CSV (Excel)");
            System.out.println("4. Exit");
            System.out.print("Choose an option: ");

            String choice = scanner.nextLine().trim();

            if (choice.equals("1")) {
                System.out.println("\n--- Add a New Device ---");

                System.out.print("Enter device type (e.g., Laptop, Phone): ");
                String type = scanner.nextLine().trim();

                System.out.print("Enter brand (e.g., Dell, Apple): ");
                String brand = scanner.nextLine().trim();

                System.out.print("Enter model (e.g., XPS 15, iPhone 13): ");
                String model = scanner.nextLine().trim();

                System.out.print("Enter RAM capacity (in GB, just the number): ");
                int ram = 0;
                try {
                    ram = Integer.parseInt(scanner.nextLine().trim());
                } catch (NumberFormatException e) {
                    System.out.println("❌ Error: Invalid RAM number. Please try again.");
                    continue;
                }

                // 1. Build the new device using the blueprint
                Device newDevice = new Device(type, brand, model, ram);

                // 2. Add it to our inventory list
                inventory.add(newDevice);

                System.out.println(
                        "✅ Success! " + brand + " " + model + " " + ram + " has been added to your inventory.");

            } else if (choice.equals("2")) {
                System.out.println("\n--- Your Device Inventory ---");

                // 1. Check if the list is empty first
                if (inventory.isEmpty()) {
                    System.out.println("Your inventory is currently empty. Add some gadgets first!");
                } else {
                    // 2. Loop through the list and print each device
                    for (int i = 0; i < inventory.size(); i++) {
                        // Get the device at the current position
                        Device currentDevice = inventory.get(i);

                        // Print it out with a number (e.g., "1. Dell XPS 15 (Laptop) - 16GB RAM")
                        System.out.println((i + 1) + ". " + currentDevice.getDetails());
                    }
                }
            } else if (choice.equals("3")) {
                System.out.println("\nExporting data...");

                // The "try" block attempts to create and write to the file
                try {
                    // This creates a file named "hardware_inventory.csv" in your project folder
                    FileWriter writer = new FileWriter("hardware_inventory.csv");

                    // 1. Write the Header Row (Column names for Excel)
                    writer.write("Type,Brand,Model,RAM_GB\n");

                    // 2. Loop through the inventory list and write the data
                    for (int i = 0; i < inventory.size(); i++) {
                        Device d = inventory.get(i);
                        writer.write(d.getType() + "," + d.getBrand() + "," + d.getModel() + "," + d.getRam() + "\n");
                    }

                    // 3. ALWAYS close the writer to save the file properly!
                    writer.close();
                    System.out.println("✅ Success! Your data was saved to 'hardware_inventory.csv'.");

                } catch (IOException e) {
                    // If something goes wrong (like a locked file), it prints this error
                    System.out.println("❌ Error: Could not save the file.");
                }
            }else if(choice.equals("4")){
                System.out.println("Saving data... Goodbye!");
                isRunning = false;
            }else{
                System.out.println("Invalid choice. Please pick 1, 2, 3 or 4.");
            }
        }
        scanner.close();
    }
}
