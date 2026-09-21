package io.virinchi.khojnepal.RestAPIController;

import io.virinchi.khojnepal.Model.ClaimTbl;
import io.virinchi.khojnepal.Model.PostTbl;
import io.virinchi.khojnepal.Model.UserTbl;
import io.virinchi.khojnepal.Repository.PostRepository;
import io.virinchi.khojnepal.Service.ClaimService;
import io.virinchi.khojnepal.Service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/api/claims")
public class ClaimRestController {

    private final ClaimService claimService;
    private final UserService userService;
    private final PostRepository pRepo;

    @GetMapping("/mine")
    public ResponseEntity<?> myClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        UserTbl user = requireUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }
        return ResponseEntity.ok(claimService.getMyClaims(user.getId(), page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable int id, HttpSession session) {
        UserTbl user = requireUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }
        ClaimTbl claim = claimService.getClaim(id, user);
        if (claim == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Claim not found"));
        }
        return ResponseEntity.ok(claim);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body, HttpSession session) {
        UserTbl user = requireUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }

        Object postIdObj = body.get("postId");
        if (postIdObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "postId required"));
        }

        int postId = Integer.parseInt(postIdObj.toString());
        PostTbl post = pRepo.findById(postId).orElse(null);
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Post not found"));
        }

        if (post.getOwnerId() == user.getId()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot claim your own post"));
        }

        if (!"verified".equalsIgnoreCase(user.getKycStatus())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "KYC verification required before claiming",
                    "kycStatus", user.getKycStatus() != null ? user.getKycStatus() : "none"
            ));
        }

        if (!claimService.canClaim(user, post)) {
            long daysLeft = claimService.getDaysLeftToClaim(post);
            if (daysLeft > 0) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Claims open after 7 days",
                        "daysLeft", daysLeft
                ));
            }
            return ResponseEntity.badRequest().body(Map.of("error", "Post is not open for claims"));
        }

        ClaimTbl claim = claimService.createClaim(user, post, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(claim);
    }

    private UserTbl requireUser(HttpSession session) {
        Object idObj = session.getAttribute("userId");
        if (idObj == null) return null;
        return userService.findById((Integer) idObj).orElse(null);
    }
}
