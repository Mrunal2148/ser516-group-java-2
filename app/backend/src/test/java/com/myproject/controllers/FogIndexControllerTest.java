package com.myproject.controllers;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public class FogIndexControllerTest {

    @Test
    void testCalculateFogIndex_withDummyUrl_returnsError() {
        FogIndexController controller = new FogIndexController();
        // URL that doesn’t point to a Git repo
        String dummyUrl = "https://example.com/archive/main.zip";

        ResponseEntity<Map<String, Object>> response = controller.calculateFogIndex(dummyUrl);

        // Expect a 500 error because the URL is invalid
        assertNotNull(response);
        assertEquals(500, response.getStatusCodeValue(), 
            "Expected an HTTP 500 error due to invalid URL");
        assertNotNull(response.getBody(), "Response body should not be null");
        assertTrue(response.getBody().containsKey("error"), 
            "Response body should contain an error key");
    }

    @Test
    void testGetFogIndexHistory_withDummyUrl_returnsEmptyList() {
        FogIndexController controller = new FogIndexController();
        String dummyUrl = "https://example.com/archive/refs/heads/main.zip";

        ResponseEntity<?> response = controller.getFogIndexHistory(dummyUrl);

        // Expect an OK with an empty list because it won't find anything
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue(),
            "Expected an HTTP 200 when fetching history");
        assertTrue(response.getBody() instanceof java.util.List,
            "Expected the response body to be a List");
        assertTrue(((java.util.List<?>)response.getBody()).isEmpty(),
            "Expected an empty list for the dummy URL’s history");
    }
}
