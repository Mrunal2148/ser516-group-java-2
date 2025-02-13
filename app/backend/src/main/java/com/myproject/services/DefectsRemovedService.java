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

    @Value("${github.token}")  // GitHub API token from application.properties
    private String githubToken;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Fetch and calculate bug statistics for a given GitHub repository.
     */
    public Map<String, Object> getBugStatistics(String owner, String repo) {
        Map<String, Integer> weeklyClosedBugs = new HashMap<>();
        Map<String, Integer> weeklyOpenedBugs = new HashMap<>();
        int totalOpenedBugs = 0;
        int totalClosedBugs = 0;

        // Fetch issues labeled "Bug"
        Map<String, Object> bugStats1 = fetchBugData(owner, repo, "Bug");
        Map<String, Object> bugStats2 = fetchBugData(owner, repo, "Type: Bug");

        // Merge the results from both labels
        mergeBugStatistics(weeklyClosedBugs, (Map<String, Integer>) bugStats1.get("weeklyClosedBugs"));
        mergeBugStatistics(weeklyClosedBugs, (Map<String, Integer>) bugStats2.get("weeklyClosedBugs"));

        mergeBugStatistics(weeklyOpenedBugs, (Map<String, Integer>) bugStats1.get("weeklyOpenedBugs"));
        mergeBugStatistics(weeklyOpenedBugs, (Map<String, Integer>) bugStats2.get("weeklyOpenedBugs"));

        totalOpenedBugs = (int) bugStats1.get("totalOpenedBugs") + (int) bugStats2.get("totalOpenedBugs");
        totalClosedBugs = (int) bugStats1.get("totalClosedBugs") + (int) bugStats2.get("totalClosedBugs");

        // Build the final statistics map
        Map<String, Object> bugStatistics = new HashMap<>();
        bugStatistics.put("weeklyClosedBugs", weeklyClosedBugs);
        bugStatistics.put("weeklyOpenedBugs", weeklyOpenedBugs);
        bugStatistics.put("totalOpenedBugs", totalOpenedBugs);
        bugStatistics.put("totalClosedBugs", totalClosedBugs);

        return bugStatistics;
    }

    // Fetch bug data from GitHub based on a specific label.
     
    private Map<String, Object> fetchBugData(String owner, String repo, String label) {
        String url = UriComponentsBuilder.fromHttpUrl("https://api.github.com/repos/{owner}/{repo}/issues")
                .queryParam("state", "all") // Fetch both opened and closed issues
                .queryParam("labels", label)
                .queryParam("per_page", 100)
                .buildAndExpand(owner, repo)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "token " + githubToken);
        headers.set("Accept", "application/vnd.github.v3+json");

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

        return parseIssues(response.getBody());
    }

    //Parse the GitHub API response to extract opened and closed bug statistics.
    
    private Map<String, Object> parseIssues(String responseBody) {
        Map<String, Integer> weeklyClosedBugs = new HashMap<>();
        Map<String, Integer> weeklyOpenedBugs = new HashMap<>();
        int totalOpenedBugs = 0;
        int totalClosedBugs = 0;

        try {
            JsonNode issues = objectMapper.readTree(responseBody);
            WeekFields weekFields = WeekFields.of(Locale.getDefault());

            for (JsonNode issue : issues) {
                if (!issue.has("pull_request")) { // Ignore PRs
                    String createdDate = issue.get("created_at").asText();
                    if (createdDate != null && !createdDate.isEmpty()) {
                        LocalDate date = LocalDate.parse(createdDate.substring(0, 10));
                        String week = date.getYear() + "-W" + date.get(weekFields.weekOfWeekBasedYear());

                        weeklyOpenedBugs.put(week, weeklyOpenedBugs.getOrDefault(week, 0) + 1);
                        totalOpenedBugs++;
                    }

                    if (issue.has("closed_at") && !issue.get("closed_at").isNull()) {
                        String closedDate = issue.get("closed_at").asText();
                        LocalDate date = LocalDate.parse(closedDate.substring(0, 10));
                        String week = date.getYear() + "-W" + date.get(weekFields.weekOfWeekBasedYear());

                        weeklyClosedBugs.put(week, weeklyClosedBugs.getOrDefault(week, 0) + 1);
                        totalClosedBugs++;
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error parsing GitHub API response", e);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("weeklyClosedBugs", weeklyClosedBugs);
        result.put("weeklyOpenedBugs", weeklyOpenedBugs);
        result.put("totalOpenedBugs", totalOpenedBugs);
        result.put("totalClosedBugs", totalClosedBugs);

        return result;
    }

    //Merges two weekly bug statistics maps.
    
    private void mergeBugStatistics(Map<String, Integer> target, Map<String, Integer> source) {
        for (Map.Entry<String, Integer> entry : source.entrySet()) {
            target.put(entry.getKey(), target.getOrDefault(entry.getKey(), 0) + entry.getValue());
        }
    }
}
