package com.example.routeplanner.dto;

import com.example.routeplanner.model.Preference;

import java.time.LocalDate;

public class MissionRequestDto {

    private String source;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private Preference preference;

    private Boolean gravityAssist;
    private String assistType;

    public MissionRequestDto() {}

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Preference getPreference() {
        return preference;
    }

    public void setPreference(Preference preference) {
        this.preference = preference;
    }

    public Boolean getGravityAssist() {
        return gravityAssist;
    }

    public void setGravityAssist(Boolean gravityAssist) {
        this.gravityAssist = gravityAssist;
    }

    public String getAssistType() {
        return assistType;
    }

    public void setAssistType(String assistType) {
        this.assistType = assistType;
    }
}