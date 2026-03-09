package com.example.routeplanner.dto;

import java.time.LocalDate;

public class RouteDto {
    private int rank;
    private LocalDate departureDate;
    private LocalDate arrivalDate;
    private int days;
    private double deltaV;

    public RouteDto() {}

    public RouteDto(LocalDate departureDate, LocalDate arrivalDate, int days, double deltaV) {
        this.departureDate = departureDate;
        this.arrivalDate = arrivalDate;
        this.days = days;
        this.deltaV = deltaV;
    }

    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }

    public LocalDate getDepartureDate() { return departureDate; }
    public void setDepartureDate(LocalDate departureDate) { this.departureDate = departureDate; }

    public LocalDate getArrivalDate() { return arrivalDate; }
    public void setArrivalDate(LocalDate arrivalDate) { this.arrivalDate = arrivalDate; }

    public int getDays() { return days; }
    public void setDays(int days) { this.days = days; }

    public double getDeltaV() { return deltaV; }
    public void setDeltaV(double deltaV) { this.deltaV = deltaV; }
}