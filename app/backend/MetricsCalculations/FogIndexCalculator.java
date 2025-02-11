package com.example.fogindex;

import java.util.HashMap;
import java.util.Map;

public class FogIndexCalculator {

    // takes "string" as input
    // gives "json" as output

    // sample output
    //    FogIndexCalculator.calculateMetrics("string");
    //    {
    //        "fogIndex": 8.04,
    //            "totalWords": 18,
    //            "totalSentences": 2,
    //            "complexWords": 2,
    //            "averageSentenceLength": 9.0,
    //            "percentageComplexWords": 11.11
    //    }


    public static Map<String, Object> calculateMetrics(String text) {
        Map<String, Object> metrics = new HashMap<>();
        int totalWords = countWords(text);
        int totalSentences = countSentences(text);
        int complexWords = countComplexWords(text);
        double fogIndex = 0.0;
        double averageSentenceLength = 0.0;
        double percentageComplexWords = 0.0;

        if (totalWords > 0 && totalSentences > 0) {
            averageSentenceLength = (double) totalWords / totalSentences;
            percentageComplexWords = ((double) complexWords / totalWords) * 100;
            fogIndex = 0.4 * (averageSentenceLength + percentageComplexWords);
        }

        metrics.put("fogIndex", fogIndex);
        metrics.put("totalWords", totalWords);
        metrics.put("totalSentences", totalSentences);
        metrics.put("complexWords", complexWords);
        metrics.put("averageSentenceLength", averageSentenceLength);
        metrics.put("percentageComplexWords", percentageComplexWords);
        return metrics;
    }

    private static int countSentences(String text) {
        if (text == null || text.isEmpty()) {
            return 0;
        }
        // Split text using sentence-ending punctuation.
        String[] sentences = text.split("[.!?]+");
        return sentences.length;
    }

    private static int countWords(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0;
        }
        // Split text on one or more whitespace characters.
        String[] words = text.trim().split("\\s+");
        return words.length;
    }

    private static int countComplexWords(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0;
        }
        String[] words = text.trim().split("\\s+");
        int count = 0;
        for (String word : words) {
            if (countSyllables(word) >= 3) {
                count++;
            }
        }
        return count;
    }

    // simple heuristic algo. nothing fancy.
    private static int countSyllables(String word) {
        word = word.toLowerCase().replaceAll("[^a-z]", "");
        int count = 0;
        boolean vowelFound = false;
        for (int i = 0; i < word.length(); i++) {
            char c = word.charAt(i);
            if ("aeiouy".indexOf(c) != -1) {
                if (!vowelFound) {
                    count++;
                    vowelFound = true;
                }
            } else {
                vowelFound = false;
            }
        }
        // Adjust for a trailing 'e'
        if (word.endsWith("e") && count > 1) {
            count--;
        }
        return count > 0 ? count : 1;
    }
}
