package io.virinchi.khojnepal.RestAPIController;

import io.virinchi.khojnepal.Model.UserTbl;
import io.virinchi.khojnepal.Service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/users")
public class UserRestController {

    private final UserService userService;

    public UserRestController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {
        UserTbl user = requireUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }
        return ResponseEntity.ok(userService.safeUser(user));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@RequestBody Map<String, String> body, HttpSession session) {
        UserTbl user = requireUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }
        userService.updateProfile(user, body);
        return ResponseEntity.ok(userService.safeUser(user));
    }

    @GetMapping("/me/rewards")
    public ResponseEntity<?> rewards(HttpSession session) {
        UserTbl user = requireUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }
        return ResponseEntity.ok(userService.getRewards(user));
    }

    @GetMapping("/me/kyc")
    public ResponseEntity<?> getMyKyc(HttpSession session) {
        UserTbl user = requireUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }
        Map<String, Object> kyc = new java.util.HashMap<>();
        kyc.put("status", user.getKycStatus() != null ? user.getKycStatus() : "none");
        kyc.put("submittedAt", user.getKycSubmittedAt());
        return ResponseEntity.ok(kyc);
    }

    @PostMapping("/me/kyc")
    public ResponseEntity<?> submitMyKyc(@RequestBody Map<String, String> body, HttpSession session) {
        UserTbl user = requireUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }
        String currentStatus = user.getKycStatus();
        if ("verified".equalsIgnoreCase(currentStatus)) {
            return ResponseEntity.badRequest().body(Map.of("error", "KYC already verified"));
        }
        if ("pending".equalsIgnoreCase(currentStatus)) {
            return ResponseEntity.badRequest().body(Map.of("error", "KYC already under review"));
        }
        String kycFront = body.get("kycFront");
        String kycBack = body.get("kycBack");
        if (kycFront == null || kycFront.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Front document is required"));
        }
        if (kycBack == null || kycBack.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Back document is required"));
        }
        userService.submitKyc(user, kycFront, kycBack);
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("status", "pending");
        result.put("message", "KYC submitted successfully. Awaiting admin review.");
        return ResponseEntity.ok(result);
    }

    private UserTbl requireUser(HttpSession session) {
        Object idObj = session.getAttribute("userId");
        if (idObj == null) return null;
        return userService.findById((Integer) idObj).orElse(null);
    }
}
