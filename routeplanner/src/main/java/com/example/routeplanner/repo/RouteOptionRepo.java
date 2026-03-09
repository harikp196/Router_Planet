package com.example.routeplanner.repo;

import com.example.routeplanner.model.RouteOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RouteOptionRepo extends JpaRepository<RouteOption, Long> {
    List<RouteOption> findByMissionIdOrderByRankAsc(Long missionId);
}