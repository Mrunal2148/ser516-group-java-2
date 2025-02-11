package com.myproject.controllers;

import com.myproject.utils.FogIndexCalculator;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/fog-index")
public class FogIndexController {

    @GetMapping("/calculate")
    public Map<String, Object> calculateFogIndex(@RequestParam String githubZipUrl) {
        Map<String, Object> response = new HashMap<>();
        try {
            FogIndexCalculator calculator = new FogIndexCalculator();
            double fogIndex = calculator.calculateFromGitHub(githubZipUrl);
            response.put("fogIndex", fogIndex);
            response.put("message", "Calculation successful");
        } catch (Exception e) {
            response.put("error", "Failed to process the request");
            response.put("details", e.getMessage());
        }
        return response;
    }
}
