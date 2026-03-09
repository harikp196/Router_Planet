package com.example.routeplanner.controller;

import com.example.routeplanner.model.Planet;
import com.example.routeplanner.repo.PlanetRepo;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planets")
public class PlanetController {

    private final PlanetRepo planetRepo;

    public PlanetController(PlanetRepo planetRepo) {
        this.planetRepo = planetRepo;
    }

    @GetMapping
    public List<Planet> getAllPlanets() {
        return planetRepo.findAll();
    }
}