package com.example.routeplanner.dto;

import com.example.routeplanner.model.Preference;
import java.util.List;

public class MissionResponseDto {

    private String source;
    private String destination;
    private Preference preference;
    private List<RouteDto> routes;

    public MissionResponseDto() {}

    // ✅ THIS is the constructor your MissionService expects
    public MissionResponseDto(String source, String destination, Preference preference, List<RouteDto> routes) {
        this.source = source;
        this.destination = destination;
        this.preference = preference;
        this.routes = routes;
    }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public Preference getPreference() { return preference; }
    public void setPreference(Preference preference) { this.preference = preference; }

    public List<RouteDto> getRoutes() { return routes; }
    public void setRoutes(List<RouteDto> routes) { this.routes = routes; }
}