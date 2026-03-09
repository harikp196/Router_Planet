package com.example.routeplanner.config;

import com.example.routeplanner.model.Planet;
import com.example.routeplanner.repo.PlanetRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final PlanetRepo planetRepo;

    public DataSeeder(PlanetRepo planetRepo) {
        this.planetRepo = planetRepo;
    }

    @Override
    public void run(String... args) {
        if (planetRepo.count() > 0) return;

        List<String> planets = List.of(
                "Mercury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune"
        );

        for (String p : planets) {
            planetRepo.save(new Planet(p));
        }
    }
}