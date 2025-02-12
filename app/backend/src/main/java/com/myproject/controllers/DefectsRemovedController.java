package com.myproject.controllers;

import com.myproject.services.DefectsRemovedService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/github")
public class DefectsRemovedController {
    
    private final DefectsRemovedService defectsRemovedService;

    public DefectsRemovedController(DefectsRemovedService defectsRemovedService) {
        this.defectsRemovedService = defectsRemovedService;
    }

    @GetMapping("/defects-removed")
    public Map<String, Integer> getDefectsRemoved(@RequestParam String owner, @RequestParam String repo) {
        return defectsRemovedService.getDefectsRemovedPerWeek(owner, repo);
    }
}
