package com.example.routeplanner.service;

import com.example.routeplanner.dto.RouteDto;
import com.example.routeplanner.model.Preference;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RoutePlannerService {

    // Sun gravitational parameter (km^3/s^2)
    private static final double MU_SUN = 1.32712440018e11;

    // 1 AU in km
    private static final double AU_KM = 149_597_870.7;

    // Mean orbital radius / semi-major axis in AU
    private static final Map<String, Double> A_AU = new HashMap<>();

    static {
        A_AU.put("Mercury", 0.387);
        A_AU.put("Venus", 0.723);
        A_AU.put("Earth", 1.000);
        A_AU.put("Mars", 1.524);
        A_AU.put("Jupiter", 5.204);
        A_AU.put("Saturn", 9.582);
        A_AU.put("Uranus", 19.201);
        A_AU.put("Neptune", 30.047);
    }

    public List<RouteDto> generateRoutes(String source,
                                         String destination,
                                         LocalDate startDate,
                                         LocalDate endDate,
                                         Preference preference,
                                         boolean gravityAssist,
                                         String assistType) {

        if (source == null || destination == null || startDate == null || endDate == null) {
            return List.of();
        }

        if (!A_AU.containsKey(source) || !A_AU.containsKey(destination)) {
            return List.of();
        }

        if (endDate.isBefore(startDate)) {
            return List.of();
        }

        if (preference == null) {
            preference = Preference.BALANCED;
        }

        if (assistType == null || assistType.isBlank()) {
            assistType = "NONE";
        }

        PhysicsResult base = hohmannEstimate(source, destination);

        List<RouteDto> routes = new ArrayList<>();

        int maxRoutes = 12;
        int stepDays = 5;

        for (LocalDate dep = startDate; !dep.isAfter(endDate) && routes.size() < maxRoutes; dep = dep.plusDays(stepDays)) {

            long offset = Math.floorMod(ChronoUnit.DAYS.between(startDate, dep), 40);

            double tofDays = base.tofDays * (1.0 + (offset - 20) * 0.002); // small variation
            double deltaV = base.deltaV * (1.0 + (offset - 20) * 0.001);

            // Assist effect
            if (gravityAssist && !"NONE".equalsIgnoreCase(assistType)) {
                if ("JUPITER".equalsIgnoreCase(assistType)) {
                    // outer planet assist
                    deltaV *= 0.85;
                    tofDays *= 1.10;
                } else if ("VENUS".equalsIgnoreCase(assistType)) {
                    // mercury assist
                    deltaV *= 0.90;
                    tofDays *= 1.15;
                }
            }

            // Preference effect
            switch (preference) {
                case MIN_TIME -> {
                    tofDays *= 0.92;
                    deltaV *= 1.08;
                }
                case MIN_FUEL -> {
                    tofDays *= 1.08;
                    deltaV *= 0.93;
                }
                case BALANCED -> {
                    // no extra change
                }
            }

            int days = Math.max(1, (int) Math.round(tofDays));
            LocalDate arr = dep.plusDays(days);

            RouteDto dto = new RouteDto();
            dto.setDepartureDate(dep);
            dto.setArrivalDate(arr);
            dto.setDays(days);
            dto.setDeltaV(round2(deltaV));

            routes.add(dto);
        }

        // Pre-sort
        switch (preference) {
            case MIN_TIME -> routes.sort(Comparator.comparingInt(RouteDto::getDays));
            case MIN_FUEL -> routes.sort(Comparator.comparingDouble(RouteDto::getDeltaV));
            case BALANCED -> routes.sort(
                    Comparator.comparingDouble(r -> (r.getDays() * 0.6) + (r.getDeltaV() * 40.0))
            );
        }

        for (int i = 0; i < routes.size(); i++) {
            routes.get(i).setRank(i + 1);
        }

        return routes;
    }

    private PhysicsResult hohmannEstimate(String src, String dst) {
        double r1 = A_AU.get(src) * AU_KM;
        double r2 = A_AU.get(dst) * AU_KM;

        double aTransfer = (r1 + r2) / 2.0;

        // Time of flight
        double tofSeconds = Math.PI * Math.sqrt(Math.pow(aTransfer, 3) / MU_SUN);
        double tofDays = tofSeconds / 86400.0;

        // Circular orbit velocities
        double v1 = Math.sqrt(MU_SUN / r1);
        double v2 = Math.sqrt(MU_SUN / r2);

        // Transfer orbit velocities
        double vT1 = Math.sqrt(MU_SUN * (2.0 / r1 - 1.0 / aTransfer));
        double vT2 = Math.sqrt(MU_SUN * (2.0 / r2 - 1.0 / aTransfer));

        double dv1 = Math.abs(vT1 - v1);
        double dv2 = Math.abs(v2 - vT2);

        PhysicsResult result = new PhysicsResult();
        result.tofDays = tofDays;
        result.deltaV = dv1 + dv2;
        return result;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private static class PhysicsResult {
        double tofDays;
        double deltaV;
    }
}