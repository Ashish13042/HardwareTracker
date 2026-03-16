package com.hardware.tracker;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import java.util.HashMap;
import java.util.Map;

public class Device {

    private Map<String, Object> properties = new HashMap<>();

    public Device() {
    }

    // 1. @JsonAnyGetter flattens the map so React sees { "type": "Laptop" }
    // instead of { "properties": { "type": "Laptop" } }
    @JsonAnyGetter
    public Map<String, Object> getProperties() {
        return properties;
    }

    // 2. @JsonAnySetter allows React to send dynamic columns back to Java
    @JsonAnySetter
    public void setProperty(String key, Object value) {
        properties.put(key, value);
    }
}