package com.example.routeplanner.controller;

import com.example.routeplanner.dto.MissionRequestDto;
import com.example.routeplanner.dto.MissionResponseDto;
import com.example.routeplanner.service.MissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/missions")
@CrossOrigin
public class MissionController {

    private final MissionService missionService;

    public MissionController(MissionService missionService) {
        this.missionService = missionService;
    }

    @PostMapping
    public ResponseEntity<MissionResponseDto> createMission(@RequestBody MissionRequestDto request) {
        return ResponseEntity.ok(missionService.createMission(request));
    }
}