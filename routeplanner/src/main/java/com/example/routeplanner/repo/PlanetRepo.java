package com.example.routeplanner.repo;

import com.example.routeplanner.model.Planet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlanetRepo extends JpaRepository<Planet, Long> {
    Optional<Planet> findByNameIgnoreCase(String name);
}