public class Device {
    private String type;
    private String brand;
    private String model;
    private int ram;

    public Device(String type, String brand, String model, int ram) {
        this.type = type;
        this.brand = brand;
        this.model = model;
        this.ram = ram;
    }

    public String getDetails() {
        return brand + " " + model + " (" + type + ") - " + ram + "GB RAM";
    }
    public String getType(){
        return type;
    }
    public String getBrand(){
        return brand;
    }
    public String getModel(){
        return model;
    }
    public int getRam(){
        return ram;
    }

    @Override
    public String toString() {
        return type + ": " + brand + " " + model + " (" + ram + "GB RAM)";
    }
}
