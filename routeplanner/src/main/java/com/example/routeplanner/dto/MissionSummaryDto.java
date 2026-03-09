package com.example.routeplanner.dto;

import java.time.LocalDate;

public class MissionSummaryDto {

    private Long id;
    private String source;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;

    public MissionSummaryDto() {}

    public MissionSummaryDto(Long id, String source, String destination,
                             LocalDate startDate, LocalDate endDate) {
        this.id = id;
        this.source = source;
        this.destination = destination;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}