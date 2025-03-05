package com.myproject.controllers;

import com.myproject.services.TestChurnService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test-churn")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class TestChurnController {

    private final TestChurnService testChurnService;

    public TestChurnController(TestChurnService testChurnService) {
        this.testChurnService = testChurnService;
    }

    @GetMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateTestChurn(
            @RequestParam String owner,
            @RequestParam String repo,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        Map<String, Object> testChurn = testChurnService.calculateTestChurn(owner, repo, startDate, endDate);
        return ResponseEntity.ok(testChurn);
    }
}
