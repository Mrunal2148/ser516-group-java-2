package com.myproject.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myproject.utils.FogIndexCalculator;

@RestController
@RequestMapping("/api/fog-index")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class FogIndexController {

    @GetMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateFogIndex(@RequestParam String githubZipUrl) {
        try {
            FogIndexCalculator calculator = new FogIndexCalculator();
            String jsonResult = calculator.calculateFromGitHub(githubZipUrl);

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> response = mapper.readValue(jsonResult, Map.class);
            response.put("message", "Calculation successful");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to process the request");
            errorResponse.put("details", e.getMessage());

            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
