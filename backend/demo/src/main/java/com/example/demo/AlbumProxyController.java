package com.example.demo; // Change this to match your actual package name!

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/my-project")
@CrossOrigin(origins = "http://localhost:5173") // This allows your Vite React app to talk to Java
public class AlbumProxyController {

    // This is the tool Java uses to make HTTP requests
    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/{projectIdentifier}")
    public ResponseEntity<String> getProjectData(@PathVariable String projectIdentifier) {
        
        // 1. Define the URL of the original API
        String apiUrl = "https://1001albumsgenerator.com/api/v1/projects/" + projectIdentifier;

        try {
            // 2. Fetch the JSON data from the 1001 Albums API
            ResponseEntity<String> response = restTemplate.getForEntity(apiUrl, String.class);
            
            // 3. Return that exact JSON data to your React frontend
            return ResponseEntity.ok(response.getBody());

        } catch (org.springframework.web.client.RestClientException e) {
            // If the project isn't found or the API is down, return an error
            return ResponseEntity.status(500).body("{\"error\": \"Could not fetch project data.\"}");
        }
    }

    @GetMapping("/stats")
public ResponseEntity<String> getGlobalStats() {
    // This is a big file, so we fetch it as a raw String
    String statsUrl = "https://1001albumsgenerator.com/api/v1/albums/stats";
    try {
        ResponseEntity<String> response = restTemplate.getForEntity(statsUrl, String.class);
        return ResponseEntity.ok(response.getBody());
    } catch (org.springframework.web.client.RestClientException e) {
        // Log the error in your JAVA terminal so you can see what happened
        System.out.println("STATS FETCH ERROR: " + e.getMessage());
        return ResponseEntity.status(500).body("{\"albums\": []}");
    }
}
}