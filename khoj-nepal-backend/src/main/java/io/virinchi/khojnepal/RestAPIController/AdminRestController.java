package io.virinchi.khojnepal.RestAPIController;

import io.virinchi.khojnepal.Model.ClaimTbl;
import io.virinchi.khojnepal.Model.UserTbl;
import io.virinchi.khojnepal.Repository.ClaimRepository;
import io.virinchi.khojnepal.Repository.PostRepository;
import io.virinchi.khojnepal.Repository.ReportRepository;
import io.virinchi.khojnepal.Repository.TipRepository;
import io.virinchi.khojnepal.Repository.UserRepository;
import io.virinchi.khojnepal.Service.AdminService;
import io.virinchi.khojnepal.Service.ClaimService;
import io.virinchi.khojnepal.Service.PostService;
import io.virinchi.khojnepal.Service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/admin")
public class AdminRestController {

    private final AdminService adminService;
    private final ClaimService claimService;
    private final PostService postService;
    private final UserService userService;
    private final UserRepository uRepo;
    private final PostRepository pRepo;
    private final ClaimRepository cRepo;
    private final TipRepository tipRepo;
    private final ReportRepository reportRepo;

    public AdminRestController(AdminService adminService, ClaimService claimService, PostService postService,
                               UserService userService, UserRepository uRepo, PostRepository pRepo,
                               ClaimRepository cRepo, TipRepository tipRepo, ReportRepository reportRepo) {
        this.adminService = adminService;
        this.claimService = claimService;
        this.postService = postService;
        this.userService = userService;
        this.uRepo = uRepo;
        this.pRepo = pRepo;
        this.cRepo = cRepo;
        this.tipRepo = tipRepo;
        this.reportRepo = reportRepo;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> stats(HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<?> users(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return ResponseEntity.ok(uRepo.findAll(pageable));
    }

    @GetMapping("/posts")
    public ResponseEntity<?> posts(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        if (type != null && status != null) {
            return ResponseEntity.ok(pRepo.findByTypeAndStatus(type, status, pageable));
        }
        if (type != null) {
            return ResponseEntity.ok(pRepo.findByType(type, pageable));
        }
        if (status != null) {
            return ResponseEntity.ok(pRepo.findByStatus(status, pageable));
        }
        return ResponseEntity.ok(pRepo.findAll(pageable));
    }

    @PostMapping("/posts/{id}/approve")
    public ResponseEntity<?> approvePost(@PathVariable int id, HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        return pRepo.findById(id)
                .<ResponseEntity<?>>map(post -> ResponseEntity.ok(postService.approvePost(post)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Post not found")));
    }

    @PostMapping("/posts/{id}/reject")
    public ResponseEntity<?> rejectPost(@PathVariable int id, HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        return pRepo.findById(id)
                .<ResponseEntity<?>>map(post -> ResponseEntity.ok(postService.rejectPost(post)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Post not found")));
    }

    @PostMapping("/posts/{id}/status")
    public ResponseEntity<?> updatePostStatus(@PathVariable int id, @RequestBody Map<String, String> body, HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "status required"));
        }
        return pRepo.findById(id)
                .<ResponseEntity<?>>map(post -> ResponseEntity.ok(postService.updateStatus(post, status, body.get("handoverStep"))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Post not found")));
    }

    @GetMapping("/claims")
    public ResponseEntity<?> claims(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(cRepo.findByStatus(status, pageable));
        }
        return ResponseEntity.ok(cRepo.findAll(pageable));
    }

    @GetMapping("/claims/{id}")
    public ResponseEntity<?> claimDetail(@PathVariable int id, HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        return cRepo.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Claim not found")));
    }

    @PostMapping("/claims/{id}/verify-kyc")
    public ResponseEntity<?> verifyKyc(@PathVariable int id, HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        return cRepo.findById(id)
                .<ResponseEntity<?>>map(claim -> ResponseEntity.ok(claimService.verifyKyc(claim)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Claim not found")));
    }

    @PostMapping("/claims/{id}/more-info")
    public ResponseEntity<?> moreInfo(@PathVariable int id, @RequestBody Map<String, String> body, HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        return cRepo.findById(id)
                .<ResponseEntity<?>>map(claim -> ResponseEntity.ok(claimService.requestMoreInfo(claim,
                        body.getOrDefault("adminMessage", "Please provide more information"))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Claim not found")));
    }

    @PostMapping("/claims/{id}/flag")
    public ResponseEntity<?> flagClaim(@PathVariable int id, HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        return cRepo.findById(id)
                .<ResponseEntity<?>>map(claim -> ResponseEntity.ok(claimService.flagClaim(claim)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Claim not found")));
    }

    @PostMapping("/claims/{id}/reject")
    public ResponseEntity<?> rejectClaim(@PathVariable int id, @RequestBody(required = false) Map<String, String> body, HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        return cRepo.findById(id)
                .<ResponseEntity<?>>map(claim -> ResponseEntity.ok(claimService.rejectClaim(claim,
                        body != null ? body.get("adminMessage") : null)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Claim not found")));
    }

    @PostMapping("/claims/{id}/approve")
    public ResponseEntity<?> approveClaim(@PathVariable int id, HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        return cRepo.findById(id)
                .<ResponseEntity<?>>map(claim -> {
                    UserTbl claimant = claim.getClaimant();
                    if (claimant == null) {
                        claimant = uRepo.findById(claim.getOwnerId()).orElse(null);
                    }
                    boolean userKycOk = claimant != null && "verified".equalsIgnoreCase(claimant.getKycStatus());
                    boolean claimKycOk = claim.isKycVerified();
                    if (!userKycOk && !claimKycOk) {
                        return ResponseEntity.badRequest().body((Object) Map.of("error", "User KYC not verified"));
                    }
                    return ResponseEntity.ok((Object) claimService.approveClaim(claim));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Claim not found")));
    }

    @GetMapping("/reports")
    public ResponseEntity<?> reports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return ResponseEntity.ok(reportRepo.findAll(pageable));
    }

    @GetMapping("/tips")
    public ResponseEntity<?> tips(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return ResponseEntity.ok(tipRepo.findAll(pageable));
    }

    @GetMapping("/suspicious")
    public ResponseEntity<?> suspicious(HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        return ResponseEntity.ok(adminService.getSuspiciousData());
    }

    @GetMapping("/recovered")
    public ResponseEntity<?> recovered(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return ResponseEntity.ok(pRepo.findByStatusIn(List.of("delivered", "owner_found"), pageable));
    }

    @GetMapping("/users/kyc-pending")
    public ResponseEntity<?> pendingKycUsers(HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        List<UserTbl> pendingUsers = uRepo.findByKycStatus("pending");
        return ResponseEntity.ok(pendingUsers.stream().map(userService::safeUser).toList());
    }

    @PostMapping("/users/{id}/kyc-approve")
    public ResponseEntity<?> approveUserKyc(@PathVariable int id, HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        return uRepo.findById(id)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(userService.approveUserKyc(user)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found")));
    }

    @PostMapping("/users/{id}/kyc-reject")
    public ResponseEntity<?> rejectUserKyc(@PathVariable int id, HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }
        return uRepo.findById(id)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(userService.rejectUserKyc(user)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found")));
    }

    private boolean isAdmin(HttpSession session) {
        Object role = session.getAttribute("role");
        Object userId = session.getAttribute("userId");
        if (role == null || userId == null) return false;
        return "admin".equalsIgnoreCase(role.toString());
    }
}
