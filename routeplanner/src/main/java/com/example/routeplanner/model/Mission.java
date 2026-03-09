package com.example.routeplanner.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "missions")
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "source_id")
    private Planet source;

    @ManyToOne(optional = false)
    @JoinColumn(name = "destination_id")
    private Planet destination;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Preference preference = Preference.BALANCED;

    public Mission() {}

    public Long getId() { return id; }

    public Planet getSource() { return source; }
    public void setSource(Planet source) { this.source = source; }

    public Planet getDestination() { return destination; }
    public void setDestination(Planet destination) { this.destination = destination; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Preference getPreference() { return preference; }
    public void setPreference(Preference preference) {
        this.preference = (preference == null) ? Preference.BALANCED : preference;
    }
}