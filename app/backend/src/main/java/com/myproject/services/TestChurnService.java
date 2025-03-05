package com.myproject.services;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;


@Service
public class TestChurnService {

    private static final Logger logger = LoggerFactory.getLogger(TestChurnService.class);
    private static final String GITHUB_API_URL = "https://api.github.com/repos/";
    private static final List<String> TEST_FILE_EXTENSIONS = Arrays.asList(".test.js", ".spec.js", ".test.ts", ".test.py", "Test.java", "test.go");

    @Value("${github.token}")
    private String githubToken;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> calculateTestChurn(String owner, String repo, String startDate, String endDate) {
        try {
            // Get first and last commit in the range
            String firstCommitSha = getFirstCommitSha(owner, repo, startDate);
            String lastCommitSha = getLastCommitSha(owner, repo, endDate);

            if (firstCommitSha == null || lastCommitSha == null) {
                logger.error("Could not determine commit range.");
                return Collections.emptyMap();
            }

            logger.info("First commit: " + firstCommitSha);
            logger.info("Last commit: " + lastCommitSha);

            // Download and extract test files from both commits
            Map<String, String> oldTestFiles = downloadAndExtractTests(owner, repo, firstCommitSha, "old_commit");
            Map<String, String> newTestFiles = downloadAndExtractTests(owner, repo, lastCommitSha, "new_commit");

            return analyzeTestChurn(oldTestFiles, newTestFiles);
        } catch (Exception e) {
            logger.error("Error calculating test churn", e);
            return Collections.emptyMap();
        }
        finally {
            // **Ensure Cleanup Happens After Response is Calculated**
           cleanupDownloadedFiles("old_commit_extracted","old_commit.zip");
           cleanupDownloadedFiles("new_commit_extracted","new_commit.zip");
            
        }
    }

    private String getFirstCommitSha(String owner, String repo, String startDate) throws IOException {
        String url = UriComponentsBuilder.fromHttpUrl(GITHUB_API_URL + owner + "/" + repo + "/commits")
                .queryParam("since", startDate + "T00:00:00Z")
                .queryParam("per_page", 1)
                .queryParam("order", "asc")
                .toUriString();

        return extractCommitSha(makeGitHubRequest(url));
    }

    private String getLastCommitSha(String owner, String repo, String endDate) throws IOException {
        String url = UriComponentsBuilder.fromHttpUrl(GITHUB_API_URL + owner + "/" + repo + "/commits")
                .queryParam("until", endDate + "T23:59:59Z")
                .queryParam("per_page", 1)
                .queryParam("order", "desc")
                .toUriString();

        return extractCommitSha(makeGitHubRequest(url));
    }

    private String extractCommitSha(String response) throws IOException {
        JsonNode commitsArray = objectMapper.readTree(response);
        if (!commitsArray.isEmpty() && commitsArray.isArray()) {
            return commitsArray.get(0).get("sha").asText();
        }
        return null;
    }

    private String makeGitHubRequest(String url) throws IOException {
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.set("Authorization", "token " + githubToken);
        headers.set("Accept", "application/vnd.github.v3+json");

        org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
        return new RestTemplate().exchange(url, org.springframework.http.HttpMethod.GET, entity, String.class).getBody();
    }

    private Map<String, String> downloadAndExtractTests(String owner, String repo, String commitSha, String folderName) throws IOException {
        String zipUrl = "https://github.com/" + owner + "/" + repo + "/archive/" + commitSha + ".zip";
        String zipFilePath = folderName + ".zip";
        String extractFolder = folderName + "_extracted";

        logger.info("Downloading ZIP: " + zipUrl);
        downloadFile(zipUrl, zipFilePath);
        extractZip(zipFilePath, extractFolder);

        return getTestFilesFromFolder(new File(extractFolder));
    }

    private void downloadFile(String fileUrl, String destination) throws IOException {
        try (BufferedInputStream in = new BufferedInputStream(new URL(fileUrl).openStream());
             FileOutputStream fileOutputStream = new FileOutputStream(destination)) {
            byte[] buffer = new byte[1024];
            int count;
            while ((count = in.read(buffer, 0, 1024)) != -1) {
                fileOutputStream.write(buffer, 0, count);
            }
        }
    }

    private void extractZip(String zipFilePath, String destinationFolder) throws IOException {
        File destDir = new File(destinationFolder);
        if (!destDir.exists()) destDir.mkdirs();

        try (ZipInputStream zipIn = new ZipInputStream(new FileInputStream(zipFilePath))) {
            ZipEntry entry;
            while ((entry = zipIn.getNextEntry()) != null) {
                File file = new File(destinationFolder, entry.getName());
                if (entry.isDirectory()) {
                    file.mkdirs();
                } else {
                    new File(file.getParent()).mkdirs();
                    try (FileOutputStream fos = new FileOutputStream(file)) {
                        byte[] buffer = new byte[1024];
                        int len;
                        while ((len = zipIn.read(buffer)) > 0) {
                            fos.write(buffer, 0, len);
                        }
                    }
                }
                zipIn.closeEntry();
            }
        }
    }

    private Map<String, String> getTestFilesFromFolder(File folder) throws IOException {
        Map<String, String> testFiles = new HashMap<>();
    
        // Recursive search
        Collection<File> allFiles = FileUtils.listFiles(folder, null, true);
        for (File file : allFiles) {
            String relativePath = file.getAbsolutePath().replace(folder.getAbsolutePath(), "");
    
            // Check if the file is a test file (either by path or extension)
            if (isTestFile(relativePath)) {
                testFiles.put(relativePath, FileUtils.readFileToString(file, "UTF-8"));
            }
        }
        return testFiles;
    }
    

    // private Map<String, Object> analyzeTestChurn(Map<String, String> oldTestFiles, Map<String, String> newTestFiles) {
    //     int addedTests = 0, deletedTests = 0, modifiedTests = 0;

    //     Set<String> allFiles = new HashSet<>(oldTestFiles.keySet());
    //     allFiles.addAll(newTestFiles.keySet());

    //     for (String filePath : allFiles) {
    //         int oldTests = countTestCases(oldTestFiles.getOrDefault(filePath, ""));
    //         int newTests = countTestCases(newTestFiles.getOrDefault(filePath, ""));

    //         if (!oldTestFiles.containsKey(filePath)) addedTests += newTests;
    //         else if (!newTestFiles.containsKey(filePath)) deletedTests += oldTests;
    //         else modifiedTests += Math.abs(newTests - oldTests);
    //     }

    //     Map<String, Object> testChurnMetrics = new HashMap<>();
    //     testChurnMetrics.put("added_tests", addedTests);
    //     testChurnMetrics.put("deleted_tests", deletedTests);
    //     testChurnMetrics.put("modified_tests", modifiedTests);
    //     testChurnMetrics.put("timestamp", new Date().toString());

  

    //     return testChurnMetrics;
    // }
    
    
    private Map<String, Object> analyzeTestChurn(Map<String, String> oldTestFiles, Map<String, String> newTestFiles) {
        int addedTests = 0, deletedTests = 0, modifiedTests = 0;
    
        Set<String> allFiles = new HashSet<>(oldTestFiles.keySet());
        allFiles.addAll(newTestFiles.keySet());
    
        for (String filePath : allFiles) {
            String oldContent = oldTestFiles.getOrDefault(filePath, "");
            String newContent = newTestFiles.getOrDefault(filePath, "");
    
            if (!oldTestFiles.containsKey(filePath)) {
                // If file is new, count all its tests as added
                addedTests += countTestCases(newContent);
            } else if (!newTestFiles.containsKey(filePath)) {
                // If file is deleted, count all its tests as deleted
                deletedTests += countTestCases(oldContent);
            } else {
                // If file exists in both commits, check for modifications
                int changedLines = countChangedLines(oldContent, newContent);
                if (changedLines > 0) {
                    modifiedTests += changedLines; // Count number of changed lines
                }
            }
        }
    
        Map<String, Object> testChurnMetrics = new HashMap<>();
        testChurnMetrics.put("added_tests", addedTests);
        testChurnMetrics.put("deleted_tests", deletedTests);
        testChurnMetrics.put("modified_tests", modifiedTests); // Now counting modified lines
        testChurnMetrics.put("timestamp", new Date().toString());
    
       // saveTestChurnToFile(testChurnMetrics);
        return testChurnMetrics;
    }
    
    
    private int countChangedLines(String oldContent, String newContent) {
        String[] oldLines = oldContent.split("\n");
        String[] newLines = newContent.split("\n");
    
        int changes = 0;
        int minLength = Math.min(oldLines.length, newLines.length);
    
        // Compare line by line
        for (int i = 0; i < minLength; i++) {
            if (!oldLines[i].trim().equals(newLines[i].trim())) {
                changes++; 
            }
        }
    
        // Count added or removed lines
        changes += Math.abs(oldLines.length - newLines.length);
    
        return changes;
    }
    
    private int countTestCases(String content) {
        return (int) Arrays.stream(content.split("\n")).filter(line ->
                line.contains("test(") || line.contains("@Test") || line.contains("def test_")
        ).count();
    }

    private boolean isTestFile(String filePath) {
        // Convert to lowercase for uniformity
        String lowerCasePath = filePath.toLowerCase();
    
        // Check if the file is inside a "test" directory
        if (lowerCasePath.contains("/test/") || lowerCasePath.contains("/tests/") || lowerCasePath.contains("/__tests__/")) {
            return true;
        }
    
        // Check if file extension is a known test type
        return TEST_FILE_EXTENSIONS.stream().anyMatch(lowerCasePath::endsWith);
    }
    

    private void cleanupDownloadedFiles(String folderName, String zipFileName) {
        if (folderName == null || zipFileName == null) return; // Skip if null
        File folder = new File(folderName);
        File zipFile = new File(zipFileName);
    
        try {
            // Delete extracted folder
            if (folder.exists()) {
                FileUtils.deleteDirectory(folder);
                logger.info("Successfully deleted folder: " + folder.getAbsolutePath());
            } else {
                logger.warn("⚠️ Folder not found: " + folder.getAbsolutePath());
            }
    
            // Delete ZIP file
            if (zipFile.exists()) {
                zipFile.delete();
                logger.info("Successfully deleted ZIP file: " + zipFile.getAbsolutePath());
            } else {
                logger.warn("⚠️ ZIP file not found: " + zipFile.getAbsolutePath());
            }
        } catch (IOException e) {
            logger.error("⚠️ Error deleting files: " + folder.getAbsolutePath() + " or " + zipFile.getAbsolutePath(), e);
        }
    }

    

}


