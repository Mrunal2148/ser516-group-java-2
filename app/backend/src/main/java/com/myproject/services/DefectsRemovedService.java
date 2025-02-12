package com.myproject.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.http.*;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.*;

@Service
public class DefectsRemovedService {
    
    private static final Logger logger = LoggerFactory.getLogger(DefectsRemovedService.class);

    @Value("${github.token}")  // Set in application.properties
    private String githubToken;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
 public Map<String, Integer> getDefectsRemovedPerWeek(String owner, String repo) {
    String url = UriComponentsBuilder.fromHttpUrl("https://api.github.com/repos/{owner}/{repo}/issues")
            .queryParam("state", "closed")
            .queryParam("labels", "Type: Bug") 
            .queryParam("per_page", 100)
            .buildAndExpand(owner, repo)
            .toUriString();  

    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", "token " + githubToken);
    headers.set("Accept", "application/vnd.github.v3+json");

    HttpEntity<String> entity = new HttpEntity<>(headers);

    System.out.println("🔵 Fetching from GitHub API: " + url);

    ResponseEntity<String> response = restTemplate.exchange(
            url, HttpMethod.GET, entity, String.class
    );

    System.out.println("🟢 GitHub API Response: " + response.getBody());

    return parseIssues(response.getBody());
}

    
    private Map<String, Integer> parseIssues(String responseBody) {
        Map<String, Integer> defectsPerWeek = new HashMap<>();
        try {
            JsonNode issues = objectMapper.readTree(responseBody);
            WeekFields weekFields = WeekFields.of(Locale.getDefault());

            for (JsonNode issue : issues) {
                if (!issue.has("pull_request")) { 
                    String closedDate = issue.get("closed_at").asText();
                    if (closedDate == null || closedDate.isEmpty()) continue; 

                    LocalDate date = LocalDate.parse(closedDate.substring(0, 10));
                    String week = date.getYear() + "-W" + date.get(weekFields.weekOfWeekBasedYear());

                    defectsPerWeek.put(week, defectsPerWeek.getOrDefault(week, 0) + 1);
                }
            }
        } catch (Exception e) {
            logger.error("Error parsing GitHub API response", e);
        }
        return defectsPerWeek;
    }
}
