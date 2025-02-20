package com.myproject.controllers;

import com.myproject.utils.FogIndexCalculator;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/fog-index")
public class FogIndexController {

    @GetMapping("/calculate")
    public Map<String, Object> calculateFogIndex(@RequestParam String githubZipUrl) {
        try {
            FogIndexCalculator calculator = new FogIndexCalculator();
            // Now the service returns a JSON string instead of a double.
            String jsonResult = calculator.calculateFromGitHub(githubZipUrl);
            // Convert the JSON string to a Map before returning.
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> response = mapper.readValue(jsonResult, Map.class);
            response.put("message", "Calculation successful");
            return response;
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to process the request");
            errorResponse.put("details", e.getMessage());
            return errorResponse;
        }
    }
}
