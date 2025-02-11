package com.myproject.utils;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import org.springframework.stereotype.Service;

@Service
public class FogIndexCalculator {

    private static final List<String> TEXT_FILE_EXTENSIONS = Arrays.asList(".java", ".txt", ".md", ".xml", ".json", ".html", ".csv");

    public double calculateFromGitHub(String githubZipUrl) throws IOException {
        String outputDir = "github_project";
        downloadAndExtractZip(githubZipUrl, outputDir);
        List<File> textFiles = getTextFiles(new File(outputDir));

        double totalFogIndex = 0;
        int fileCount = 0;

        for (File file : textFiles) {
            String content = readFile(file);
            double fogIndex = calculateFogIndex(content);
            totalFogIndex += fogIndex;
            fileCount++;
        }

        return fileCount == 0 ? 0 : totalFogIndex / fileCount;
    }

    private void downloadAndExtractZip(String fileUrl, String outputDir) throws IOException {
        URL url = new URL(fileUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        InputStream inputStream = conn.getInputStream();
        
        File dir = new File(outputDir);
        if (!dir.exists()) dir.mkdirs();

        ZipInputStream zipIn = new ZipInputStream(inputStream);
        ZipEntry entry;
        byte[] buffer = new byte[1024];

        while ((entry = zipIn.getNextEntry()) != null) {
            File newFile = new File(outputDir, entry.getName());
            if (entry.isDirectory()) {
                newFile.mkdirs();
            } else {
                new File(newFile.getParent()).mkdirs();
                FileOutputStream fos = new FileOutputStream(newFile);
                int len;
                while ((len = zipIn.read(buffer)) > 0) {
                    fos.write(buffer, 0, len);
                }
                fos.close();
            }
            zipIn.closeEntry();
        }
        zipIn.close();
    }

    private List<File> getTextFiles(File dir) {
        List<File> textFiles = new ArrayList<>();
        File[] files = dir.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    textFiles.addAll(getTextFiles(file));
                } else if (isTextFile(file.getName())) {
                    textFiles.add(file);
                }
            }
        }
        return textFiles;
    }

    private boolean isTextFile(String fileName) {
        return TEXT_FILE_EXTENSIONS.stream().anyMatch(fileName::endsWith);
    }

    private String readFile(File file) throws IOException {
        StringBuilder content = new StringBuilder();
        BufferedReader reader = new BufferedReader(new FileReader(file));
        String line;
        while ((line = reader.readLine()) != null) {
            content.append(line).append(" ");
        }
        reader.close();
        return content.toString();
    }

    private double calculateFogIndex(String text) {
        int wordCount = countWords(text);
        int sentenceCount = countSentences(text);
        int complexWordCount = countComplexWords(text);

        if (sentenceCount == 0) return 0;

        double averageSentenceLength = (double) wordCount / sentenceCount;
        double complexWordPercentage = ((double) complexWordCount / wordCount) * 100;

        return 0.4 * (averageSentenceLength + complexWordPercentage);
    }

    private int countWords(String text) {
        return text.split("\\s+").length;
    }

    private int countSentences(String text) {
        return text.split("[.!?]").length;
    }

    private int countComplexWords(String text) {
        return (int) Arrays.stream(text.split("\\s+")).filter(word -> word.length() > 6).count();
    }
}
