package io.virinchi.khojnepal.Controller;

import io.virinchi.khojnepal.Model.ClaimTbl;
import io.virinchi.khojnepal.Model.PostTbl;
import io.virinchi.khojnepal.Model.UserTbl;
import io.virinchi.khojnepal.Repository.*;
import io.virinchi.khojnepal.Service.AdminService;
import io.virinchi.khojnepal.Service.ClaimService;
import io.virinchi.khojnepal.Service.PostService;
import io.virinchi.khojnepal.Service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ClaimService claimService;
    private final PostService postService;
    private final UserService userService;
    private final UserRepository userRepo;
    private final PostRepository postRepo;
    private final ClaimRepository claimRepo;
    private final ReportRepository reportRepo;
    private final TipRepository tipRepo;

    /* ──────── helpers ──────── */

    private UserTbl getAdmin(HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) return null;
        return userRepo.findById(userId).orElse(null);
    }

    private boolean isAdmin(HttpSession session) {
        Object role = session.getAttribute("role");
        Object userId = session.getAttribute("userId");
        return role != null && userId != null && "admin".equalsIgnoreCase(role.toString());
    }

    private UserTbl getAdminUser(HttpSession session) {
        Object userId = session.getAttribute("userId");
        if (userId == null) return null;
        return userRepo.findById((Integer) userId).orElse(null);
    }

    private void addUserJson(UserTbl user, Model model) {
        if (user == null) return;
        String json = "{\"id\":" + user.getId()
            + ",\"fullName\":\"" + esc(user.getFullName()) + "\""
            + ",\"username\":\"" + esc(user.getUsername()) + "\""
            + ",\"email\":\"" + esc(user.getEmail()) + "\""
            + ",\"role\":\"" + esc(user.getRole()) + "\""
            + ",\"kycStatus\":\"" + esc(user.getKycStatus()) + "\"}";
        model.addAttribute("userJson", json);
    }

    private static String esc(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }

    private String statsJson(Map<String, Object> stats) {
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"users\":").append(stats.getOrDefault("users", 0));
        sb.append(",\"posts\":").append(stats.getOrDefault("posts", 0));
        sb.append(",\"pendingPosts\":").append(stats.getOrDefault("pendingPosts", 0));
        sb.append(",\"claims\":").append(stats.getOrDefault("claims", 0));
        sb.append(",\"openReports\":").append(stats.getOrDefault("openReports", 0));
        sb.append(",\"newTips\":").append(stats.getOrDefault("newTips", 0));
        sb.append(",\"recovered\":").append(stats.getOrDefault("recovered", 0));
        sb.append("}");
        return sb.toString();
    }

    private String adminClaimsJson(List<ClaimTbl> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            ClaimTbl c = list.get(i);
            if (i > 0) sb.append(",");
            sb.append("{\"id\":").append(c.getId());
            sb.append(",\"ownerId\":").append(c.getOwnerId());
            sb.append(",\"postId\":").append(c.getPostId());
            sb.append(",\"itemTitle\":\"").append(esc(c.getItemTitle())).append("\"");
            sb.append(",\"status\":\"").append(esc(c.getStatus())).append("\"");
            sb.append(",\"investigation\":\"").append(esc(c.getInvestigation())).append("\"");
            sb.append(",\"dayOfSeven\":").append(c.getDayOfSeven());
            sb.append(",\"submittedDate\":\"").append(esc(c.getSubmittedDate())).append("\"");
            sb.append(",\"resolvedDate\":\"").append(esc(c.getResolvedDate())).append("\"");
            sb.append(",\"claimantName\":\"").append(esc(c.getClaimantName())).append("\"");
            sb.append(",\"claimantPhone\":\"").append(esc(c.getClaimantPhone())).append("\"");
            sb.append(",\"claimantEmail\":\"").append(esc(c.getClaimantEmail())).append("\"");
            sb.append(",\"claimantAddress\":\"").append(esc(c.getClaimantAddress())).append("\"");
            sb.append(",\"ownership\":\"").append(esc(c.getOwnership())).append("\"");
            sb.append(",\"kycVerified\":").append(c.isKycVerified());
            sb.append(",\"kycFront\":\"").append(esc(c.getKycFront())).append("\"");
            sb.append(",\"kycBack\":\"").append(esc(c.getKycBack())).append("\"");
            sb.append(",\"proofImage\":\"").append(esc(c.getProofImage())).append("\"");
            sb.append(",\"notes\":\"").append(esc(c.getNotes())).append("\"");
            sb.append(",\"adminMessage\":\"").append(esc(c.getAdminMessage())).append("\"");
            sb.append(",\"historyJson\":\"").append(esc(c.getHistoryJson())).append("\"");
            sb.append("}");
        }
        sb.append("]");
        return sb.toString();
    }

    private String usersJson(List<UserTbl> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            UserTbl u = list.get(i);
            if (i > 0) sb.append(",");
            sb.append("{\"id\":").append(u.getId());
            sb.append(",\"fullName\":\"").append(esc(u.getFullName())).append("\"");
            sb.append(",\"username\":\"").append(esc(u.getUsername())).append("\"");
            sb.append(",\"email\":\"").append(esc(u.getEmail())).append("\"");
            sb.append(",\"role\":\"").append(esc(u.getRole())).append("\"");
            sb.append(",\"kycStatus\":\"").append(esc(u.getKycStatus())).append("\"");
            sb.append(",\"points\":").append(u.getPoints());
            sb.append(",\"mobile\":\"").append(esc(u.getMobile())).append("\"");
            sb.append(",\"province\":\"").append(esc(u.getProvince())).append("\"");
            sb.append(",\"district\":\"").append(esc(u.getDistrict())).append("\"");
            sb.append(",\"city\":\"").append(esc(u.getCity())).append("\"");
            sb.append(",\"gender\":\"").append(esc(u.getGender())).append("\"");
            sb.append(",\"dateOfBirth\":\"").append(esc(u.getDateOfBirth())).append("\"");
            sb.append(",\"profilePicture\":\"").append(esc(u.getProfilePicture())).append("\"");
            sb.append(",\"memberSince\":\"").append(esc(u.getMemberSince())).append("\"");
            sb.append(",\"itemsReported\":").append(u.getItemsReported());
            sb.append(",\"itemsReturned\":").append(u.getItemsReturned());
            sb.append("}");
        }
        sb.append("]");
        return sb.toString();
    }

    /* ══════════════════════════════════════════
       Page routes
       ══════════════════════════════════════════ */

    @GetMapping({"/admin", "/admin/", "/admin/dashboard", "/admin/dashboard.html"})
    public String dashboard(HttpSession session, Model model) {
        UserTbl adminUser = getAdmin(session);
        Map<String, Object> stats = adminService.getDashboardStats();
        model.addAttribute("adminUser", adminUser);
        model.addAttribute("stats", stats);
        model.addAttribute("statsJson", statsJson(stats));
        model.addAttribute("adminClaimsJson", adminClaimsJson(claimRepo.findAll()));
        model.addAttribute("pendingPosts", postRepo.findByStatusOrderByIdDesc("pending"));
        model.addAttribute("pendingClaims", claimRepo.findByStatusOrderByIdDesc("under_review"));
        model.addAttribute("currentPage", "admin-dashboard");
        addUserJson(adminUser, model);
        return "admin/dashboard";
    }

    @GetMapping({"/admin/login", "/admin/login.html"})
    public String adminLogin() { return "admin/login"; }

    @GetMapping({"/admin/posts", "/admin/posts.html"})
    public String posts(HttpSession session, Model model) {
        UserTbl adminUser = getAdmin(session);
        model.addAttribute("adminUser", adminUser);
        model.addAttribute("posts", postRepo.findAll());
        model.addAttribute("usersJson", usersJson(userRepo.findAll()));
        model.addAttribute("currentPage", "admin-posts");
        addUserJson(adminUser, model);
        return "admin/posts";
    }

    @GetMapping({"/admin/lost", "/admin/lost.html"})
    public String lost(HttpSession session, Model model) {
        UserTbl adminUser = getAdmin(session);
        model.addAttribute("adminUser", adminUser);
        model.addAttribute("posts", postRepo.findByTypeOrderByIdDesc("lost"));
        model.addAttribute("currentPage", "admin-lost");
        addUserJson(adminUser, model);
        return "admin/lost";
    }

    @GetMapping({"/admin/found", "/admin/found.html"})
    public String found(HttpSession session, Model model) {
        UserTbl adminUser = getAdmin(session);
        model.addAttribute("adminUser", adminUser);
        model.addAttribute("posts", postRepo.findByTypeOrderByIdDesc("found"));
        model.addAttribute("currentPage", "admin-found");
        addUserJson(adminUser, model);
        return "admin/found";
    }

    @GetMapping({"/admin/claims", "/admin/claims.html"})
    public String claims(HttpSession session, Model model) {
        UserTbl adminUser = getAdmin(session);
        List<ClaimTbl> allClaims = claimRepo.findAll();
        model.addAttribute("adminUser", adminUser);
        model.addAttribute("claims", allClaims);
        model.addAttribute("adminClaimsJson", adminClaimsJson(allClaims));
        model.addAttribute("currentPage", "admin-claims");
        addUserJson(adminUser, model);
        return "admin/claims";
    }

    @GetMapping({"/admin/verification", "/admin/verification.html"})
    public String verification(HttpSession session, Model model) {
        UserTbl adminUser = getAdmin(session);
        List<UserTbl> allUsers = userRepo.findAll();
        model.addAttribute("adminUser", adminUser);
        model.addAttribute("kycPendingUsers", userRepo.findByKycStatus("pending"));
        model.addAttribute("allUsers", allUsers);
        model.addAttribute("usersJson", usersJson(allUsers));
        model.addAttribute("currentPage", "admin-verification");
        addUserJson(adminUser, model);
        return "admin/verification";
    }

    @GetMapping({"/admin/suspicious", "/admin/suspicious.html"})
    public String suspicious(HttpSession session, Model model) {
        UserTbl adminUser = getAdmin(session);
        model.addAttribute("adminUser", adminUser);
        Map<String, Object> data = adminService.getSuspiciousData();
        model.addAttribute("suspiciousPosts", data.get("posts"));
        model.addAttribute("suspiciousClaims", data.get("claims"));
        model.addAttribute("adminClaimsJson", adminClaimsJson(claimRepo.findAll()));
        model.addAttribute("currentPage", "admin-suspicious");
        addUserJson(adminUser, model);
        return "admin/suspicious";
    }

    @GetMapping({"/admin/users", "/admin/users.html"})
    public String users(HttpSession session, Model model) {
        UserTbl adminUser = getAdmin(session);
        List<UserTbl> allUsers = userRepo.findAll();
        model.addAttribute("adminUser", adminUser);
        model.addAttribute("users", allUsers);
        model.addAttribute("usersJson", usersJson(allUsers));
        model.addAttribute("currentPage", "admin-users");
        addUserJson(adminUser, model);
        return "admin/users";
    }

    @GetMapping({"/admin/recovered", "/admin/recovered.html"})
    public String recovered(HttpSession session, Model model) {
        UserTbl adminUser = getAdmin(session);
        model.addAttribute("adminUser", adminUser);
        model.addAttribute("recoveredPosts", postRepo.findByStatusInOrderByIdDesc(
                List.of("delivered", "owner_found")));
        model.addAttribute("currentPage", "admin-recovered");
        addUserJson(adminUser, model);
        return "admin/recovered";
    }

    @GetMapping({"/admin/rewards", "/admin/rewards.html"})
    public String rewards(HttpSession session, Model model) {
        UserTbl adminUser = getAdmin(session);
        model.addAttribute("adminUser", adminUser);
        model.addAttribute("usersJson", usersJson(userRepo.findAll()));
        model.addAttribute("currentPage", "admin-rewards");
        addUserJson(adminUser, model);
        return "admin/rewards";
    }

    @GetMapping({"/admin/reports", "/admin/reports.html"})
    public String reports(HttpSession session, Model model) {
        UserTbl adminUser = getAdmin(session);
        model.addAttribute("adminUser", adminUser);
        model.addAttribute("reports", reportRepo.findAll());
        model.addAttribute("adminClaimsJson", adminClaimsJson(claimRepo.findAll()));
        model.addAttribute("currentPage", "admin-reports");
        addUserJson(adminUser, model);
        return "admin/reports";
    }

    @GetMapping({"/admin/settings", "/admin/settings.html"})
    public String settings(HttpSession session, Model model) {
        UserTbl adminUser = getAdmin(session);
        model.addAttribute("adminUser", adminUser);
        model.addAttribute("currentPage", "admin-settings");
        addUserJson(adminUser, model);
        return "admin/settings";
    }

    @GetMapping({"/admin/post-detail", "/admin/post-detail.html"})
    public String postDetail(@RequestParam(value = "id", required = false) Integer id,
                             HttpSession session, Model model) {
        UserTbl adminUser = getAdmin(session);
        PostTbl post = null;
        List<ClaimTbl> postClaims = Collections.emptyList();
        if (id != null) {
            post = postRepo.findById(id).orElse(null);
            if (post != null) postClaims = claimRepo.findByPostIdOrderByIdDesc(id);
        }
        model.addAttribute("adminUser", adminUser);
        model.addAttribute("post", post);
        model.addAttribute("postClaims", postClaims);
        model.addAttribute("currentPage", "admin-post-detail");
        addUserJson(adminUser, model);
        return "admin/post-detail";
    }

    /* ══════════════════════════════════════════
       Admin API endpoints
       ══════════════════════════════════════════ */

    @PostMapping("/admin/posts/{id}/approve")
    @ResponseBody
    public ResponseEntity<?> approvePost(@PathVariable int id, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        return postRepo.findById(id)
                .<ResponseEntity<?>>map(post -> ResponseEntity.ok(postService.approvePost(post)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Post not found")));
    }

    @PostMapping("/admin/posts/{id}/reject")
    @ResponseBody
    public ResponseEntity<?> rejectPost(@PathVariable int id, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        return postRepo.findById(id)
                .<ResponseEntity<?>>map(post -> ResponseEntity.ok(postService.rejectPost(post)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Post not found")));
    }

    @PostMapping("/admin/posts/{id}/status")
    @ResponseBody
    public ResponseEntity<?> updatePostStatus(@PathVariable int id, @RequestBody Map<String, String> body, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        String status = body.get("status");
        if (status == null || status.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "status required"));
        return postRepo.findById(id)
                .<ResponseEntity<?>>map(post -> ResponseEntity.ok(postService.updateStatus(post, status, body.get("handoverStep"))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Post not found")));
    }

    @PostMapping("/admin/claims/{id}/verify-kyc")
    @ResponseBody
    public ResponseEntity<?> verifyKyc(@PathVariable int id, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        return claimRepo.findById(id)
                .<ResponseEntity<?>>map(claim -> ResponseEntity.ok(claimService.verifyKyc(claim)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Claim not found")));
    }

    @PostMapping("/admin/claims/{id}/more-info")
    @ResponseBody
    public ResponseEntity<?> moreInfo(@PathVariable int id, @RequestBody Map<String, String> body, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        return claimRepo.findById(id)
                .<ResponseEntity<?>>map(claim -> ResponseEntity.ok(claimService.requestMoreInfo(claim,
                        body.getOrDefault("adminMessage", "Please provide more information"))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Claim not found")));
    }

    @PostMapping("/admin/claims/{id}/flag")
    @ResponseBody
    public ResponseEntity<?> flagClaim(@PathVariable int id, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        return claimRepo.findById(id)
                .<ResponseEntity<?>>map(claim -> ResponseEntity.ok(claimService.flagClaim(claim)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Claim not found")));
    }

    @PostMapping("/admin/claims/{id}/reject")
    @ResponseBody
    public ResponseEntity<?> rejectClaim(@PathVariable int id, @RequestBody(required = false) Map<String, String> body, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        return claimRepo.findById(id)
                .<ResponseEntity<?>>map(claim -> ResponseEntity.ok(claimService.rejectClaim(claim,
                        body != null ? body.get("adminMessage") : null)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Claim not found")));
    }

    @PostMapping("/admin/claims/{id}/approve")
    @ResponseBody
    public ResponseEntity<?> approveClaim(@PathVariable int id, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        return claimRepo.findById(id)
                .<ResponseEntity<?>>map(claim -> {
                    UserTbl claimant = claim.getClaimant();
                    if (claimant == null) claimant = userRepo.findById(claim.getOwnerId()).orElse(null);
                    boolean userKycOk = claimant != null && "verified".equalsIgnoreCase(claimant.getKycStatus());
                    boolean claimKycOk = claim.isKycVerified();
                    if (!userKycOk && !claimKycOk)
                        return ResponseEntity.badRequest().body((Object) Map.of("error", "User KYC not verified"));
                    return ResponseEntity.ok((Object) claimService.approveClaim(claim));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Claim not found")));
    }

    @PostMapping("/admin/users/{id}/kyc-approve")
    @ResponseBody
    public ResponseEntity<?> approveUserKyc(@PathVariable int id, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        return userRepo.findById(id)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(userService.approveUserKyc(user)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found")));
    }

    @PostMapping("/admin/users/{id}/kyc-reject")
    @ResponseBody
    public ResponseEntity<?> rejectUserKyc(@PathVariable int id, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        return userRepo.findById(id)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(userService.rejectUserKyc(user)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found")));
    }
}
