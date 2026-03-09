package com.example.routeplanner.repo;

import com.example.routeplanner.model.Mission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MissionRepo extends JpaRepository<Mission, Long> {

    // Optional: find missions by source planet name
    List<Mission> findBySource_NameIgnoreCase(String sourceName);

    // Optional: find missions by destination planet name
    List<Mission> findByDestination_NameIgnoreCase(String destinationName);

}