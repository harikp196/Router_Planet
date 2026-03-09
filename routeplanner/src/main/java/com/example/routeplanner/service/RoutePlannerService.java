package com.example.routeplanner.service;

import com.example.routeplanner.dto.RouteDto;
import com.example.routeplanner.model.Preference;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class RoutePlannerService {

    // --- Physics constants (Hohmann approximation) ---
    private static final double MU_SUN = 1.32712440018e11; // km^3/s^2
    private static final double AU_KM  = 149_597_870.7;    // km

    private static final Map<String, Double> A_AU = new HashMap<>();
    static {
        A_AU.put("Mercury", 0.387);
        A_AU.put("Venus",   0.723);
        A_AU.put("Earth",   1.000);
        A_AU.put("Mars",    1.524);
        A_AU.put("Jupiter", 5.204);
        A_AU.put("Saturn",  9.582);
        A_AU.put("Uranus",  19.201);
        A_AU.put("Neptune", 30.047);
    }

    // ----------------------------
    // ✅ Overload 1: 4 args
    // ----------------------------
    public List<RouteDto> generateRoutes(String source, String destination,
                                         LocalDate startDate, LocalDate endDate) {
        return generateRoutes(source, destination, startDate, endDate, Preference.BALANCED, false, "NONE");
    }

    // ----------------------------
    // ✅ Overload 2: 5 args  (THIS fixes "Expected 5 but found 4")
    // ----------------------------
    public List<RouteDto> generateRoutes(String source, String destination,
                                         LocalDate startDate, LocalDate endDate,
                                         Preference preference) {
        return generateRoutes(source, destination, startDate, endDate, preference, false, "NONE");
    }

    // ----------------------------
    // ✅ Main method: 7 args (assist supported)
    // ----------------------------
    public List<RouteDto> generateRoutes(String source, String destination,
                                         LocalDate startDate, LocalDate endDate,
                                         Preference preference,
                                         boolean gravityAssist,
                                         String assistType) {

        if (source == null || destination == null) return List.of();
        if (startDate == null || endDate == null) return List.of();
        if (!A_AU.containsKey(source) || !A_AU.containsKey(destination)) return List.of();
        if (endDate.isBefore(startDate)) return List.of();

        if (preference == null) preference = Preference.BALANCED;
        if (assistType == null) assistType = "NONE";

        // Use multiple departure samples so routes differ
        int stepDays = 5;
        int maxRoutes = 12;

        PhysicsResult base = hohmannEstimate(source, destination);

        List<RouteDto> routes = new ArrayList<>();
        for (LocalDate dep = startDate; !dep.isAfter(endDate) && routes.size() < maxRoutes; dep = dep.plusDays(stepDays)) {

            // small window effect so not identical (still based on base physics)
            long offset = Math.floorMod(ChronoUnit.DAYS.between(startDate, dep), 40);

            double tofDays = base.tofDays * (1.0 + (offset - 20) * 0.002);  // +/- ~4%
            double deltaV  = base.deltaV  * (1.0 + (offset - 20) * 0.001);  // +/- ~2%

            // Apply assist only when enabled
            if (gravityAssist && !"NONE".equalsIgnoreCase(assistType)) {
                // Very simplified: assist reduces ΔV but adds TOF
                if ("JUPITER".equalsIgnoreCase(assistType)) {
                    deltaV *= 0.85;   // ~15% reduction
                    tofDays *= 1.10;  // ~10% longer
                } else if ("VENUS".equalsIgnoreCase(assistType)) {
                    deltaV *= 0.90;   // ~10% reduction
                    tofDays *= 1.15;  // ~15% longer
                }
            }

            int days = (int) Math.max(1, Math.round(tofDays));
            LocalDate arr = dep.plusDays(days);

            RouteDto dto = new RouteDto();
            dto.setDepartureDate(dep);
            dto.setArrivalDate(arr);
            dto.setDays(days);
            dto.setDeltaV(round2(deltaV));

            routes.add(dto);
        }

        // light sorting (MissionService will sort again based on pref)
        if (preference == Preference.MIN_TIME) {
            routes.sort(Comparator.comparingInt(RouteDto::getDays));
        } else if (preference == Preference.MIN_FUEL) {
            routes.sort(Comparator.comparingDouble(RouteDto::getDeltaV));
        } else {
            routes.sort(Comparator.comparingDouble(r -> r.getDays() * 0.6 + r.getDeltaV() * 40.0));
        }

        for (int i = 0; i < routes.size(); i++) {
            routes.get(i).setRank(i + 1);
        }

        return routes;
    }

    // ----------------------------
    // Physics: Hohmann estimate (approx realistic scale)
    // ----------------------------
    private PhysicsResult hohmannEstimate(String src, String dst) {
        double r1 = A_AU.get(src) * AU_KM;
        double r2 = A_AU.get(dst) * AU_KM;

        double aT = (r1 + r2) / 2.0;

        double tofSeconds = Math.PI * Math.sqrt(Math.pow(aT, 3) / MU_SUN);
        double tofDays = tofSeconds / 86400.0;

        double v1 = Math.sqrt(MU_SUN / r1);
        double v2 = Math.sqrt(MU_SUN / r2);

        double vT1 = Math.sqrt(MU_SUN * (2.0 / r1 - 1.0 / aT));
        double vT2 = Math.sqrt(MU_SUN * (2.0 / r2 - 1.0 / aT));

        double dv1 = Math.abs(vT1 - v1);
        double dv2 = Math.abs(v2 - vT2);

        PhysicsResult pr = new PhysicsResult();
        pr.tofDays = tofDays;
        pr.deltaV = dv1 + dv2;
        return pr;
    }

    private static class PhysicsResult {
        double tofDays;
        double deltaV;
    }

    private double round2(double x) {
        return Math.round(x * 100.0) / 100.0;
    }
}