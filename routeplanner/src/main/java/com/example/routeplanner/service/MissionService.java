package com.example.routeplanner.service;

import com.example.routeplanner.dto.MissionRequestDto;
import com.example.routeplanner.dto.MissionResponseDto;
import com.example.routeplanner.dto.RouteDto;
import com.example.routeplanner.model.Mission;
import com.example.routeplanner.model.Planet;
import com.example.routeplanner.model.Preference;
import com.example.routeplanner.model.RouteOption;
import com.example.routeplanner.repo.MissionRepo;
import com.example.routeplanner.repo.PlanetRepo;
import com.example.routeplanner.repo.RouteOptionRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

@Service
public class MissionService {

    private final MissionRepo missionRepo;
    private final PlanetRepo planetRepo;
    private final RoutePlannerService routePlannerService;
    private final RouteOptionRepo routeOptionRepo;

    public MissionService(MissionRepo missionRepo,
                          PlanetRepo planetRepo,
                          RoutePlannerService routePlannerService,
                          RouteOptionRepo routeOptionRepo) {
        this.missionRepo = missionRepo;
        this.planetRepo = planetRepo;
        this.routePlannerService = routePlannerService;
        this.routeOptionRepo = routeOptionRepo;
    }

    @Transactional
    public MissionResponseDto createMission(MissionRequestDto request) {

        if (request == null) {
            throw new IllegalArgumentException("Mission request is required.");
        }

        if (request.getSource() == null || request.getDestination() == null) {
            throw new IllegalArgumentException("Source and destination are required.");
        }

        if (request.getSource().equalsIgnoreCase(request.getDestination())) {
            throw new IllegalArgumentException("Source and destination cannot be the same.");
        }

        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new IllegalArgumentException("Start date and end date are required.");
        }

        long diff = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        if (diff < 10) {
            throw new IllegalArgumentException("End date must be at least 10 days after start date.");
        }

        Planet source = planetRepo.findByNameIgnoreCase(request.getSource())
                .orElseThrow(() -> new IllegalArgumentException("Invalid source planet: " + request.getSource()));

        Planet destination = planetRepo.findByNameIgnoreCase(request.getDestination())
                .orElseThrow(() -> new IllegalArgumentException("Invalid destination planet: " + request.getDestination()));

        Preference pref = request.getPreference();
        if (pref == null) {
            pref = Preference.BALANCED;
        }

        boolean gravityAssist = Boolean.TRUE.equals(request.getGravityAssist());
        String assistType = request.getAssistType();
        if (assistType == null || assistType.isBlank()) {
            assistType = "NONE";
        }

        // Save mission
        Mission mission = new Mission();
        mission.setSource(source);
        mission.setDestination(destination);
        mission.setStartDate(request.getStartDate());
        mission.setEndDate(request.getEndDate());
        mission.setPreference(pref);
        missionRepo.save(mission);

        // Generate routes
        List<RouteDto> routes = routePlannerService.generateRoutes(
                source.getName(),
                destination.getName(),
                request.getStartDate(),
                request.getEndDate(),
                pref,
                gravityAssist,
                assistType
        );

        // Final sorting
        switch (pref) {
            case MIN_TIME -> routes.sort(
                    Comparator.comparingInt(RouteDto::getDays)
                            .thenComparingDouble(RouteDto::getDeltaV)
            );
            case MIN_FUEL -> routes.sort(
                    Comparator.comparingDouble(RouteDto::getDeltaV)
                            .thenComparingInt(RouteDto::getDays)
            );
            case BALANCED -> routes.sort(
                    Comparator.comparingDouble(r -> (r.getDays() * 0.6) + (r.getDeltaV() * 40.0))
            );
        }

        // Rank and save options
        for (int i = 0; i < routes.size(); i++) {
            RouteDto r = routes.get(i);
            r.setRank(i + 1);

            RouteOption opt = new RouteOption();
            opt.setMission(mission);
            opt.setRank(i + 1);
            opt.setDepartureDate(r.getDepartureDate());
            opt.setArrivalDate(r.getArrivalDate());
            opt.setDays(r.getDays());
            opt.setDeltaV(r.getDeltaV());
            routeOptionRepo.save(opt);
        }

        return new MissionResponseDto(
                source.getName(),
                destination.getName(),
                pref,
                gravityAssist,
                assistType,
                routes
        );
    }
}