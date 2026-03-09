package com.example.routeplanner.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "route_options")
public class RouteOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Mission mission;

    private int rank;
    private LocalDate departureDate;
    private LocalDate arrivalDate;
    private int days;
    private double deltaV;

    public RouteOption() {}

    public Long getId() { return id; }

    public Mission getMission() { return mission; }
    public void setMission(Mission mission) { this.mission = mission; }

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