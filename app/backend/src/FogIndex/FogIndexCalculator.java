package com.example.fogindex;

public class FogIndexCalculator {

   // Takes text input - which is all the data from repo/file.
    public static double calculateFogIndex(String text) {
        int totalWords = countWords(text);
        int totalSentences = countSentences(text);
        int totalComplexWords = countComplexWords(text);

        if (totalWords == 0 || totalSentences == 0) {
            return 0.0;
        }

        double averageSentenceLength = (double) totalWords / totalSentences;
        double percentageComplexWords = ((double) totalComplexWords / totalWords) * 100;

        return 0.4 * (averageSentenceLength + percentageComplexWords);
    }

    private static int countSentences(String text) {
        if (text == null || text.isEmpty()) {
            return 0;
        }
        // Splits text on punctuation that typically ends a sentence.
        String[] sentences = text.split("[.!?]+");
        return sentences.length;
    }

    private static int countWords(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0;
        }
        // Splits on one or more whitespace characters.
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
