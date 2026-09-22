package io.virinchi.khojnepal.Controller;

import io.virinchi.khojnepal.Model.*;
import io.virinchi.khojnepal.Repository.*;
import io.virinchi.khojnepal.Service.NotificationService;
import io.virinchi.khojnepal.Service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Controller
public class UserController {

    private final UserRepository userRepo;
    private final PostRepository postRepo;
    private final NotificationRepository notificationRepo;
    private final ActivityRepository activityRepo;
    private final ClaimRepository claimRepo;
    private final UserService userService;
    private final NotificationService notificationService;

    public UserController(UserRepository userRepo, PostRepository postRepo,
                          NotificationRepository notificationRepo, ActivityRepository activityRepo,
                          ClaimRepository claimRepo, UserService userService,
                          NotificationService notificationService) {
        this.userRepo = userRepo;
        this.postRepo = postRepo;
        this.notificationRepo = notificationRepo;
        this.activityRepo = activityRepo;
        this.claimRepo = claimRepo;
        this.userService = userService;
        this.notificationService = notificationService;
    }


    private UserTbl getUser(HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) return null;
        return userRepo.findById(userId).orElse(null);
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

    private String notificationsJson(List<NotificationTbl> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            NotificationTbl n = list.get(i);
            if (i > 0) sb.append(",");
            sb.append("{\"id\":").append(n.getId());
            sb.append(",\"ownerId\":").append(n.getOwnerId());
            sb.append(",\"type\":\"").append(esc(n.getType())).append("\"");
            sb.append(",\"notifKey\":\"").append(esc(n.getNotifKey())).append("\"");
            sb.append(",\"readFlag\":").append(n.isReadFlag());
            sb.append(",\"timeLabel\":\"").append(esc(n.getTimeLabel())).append("\"");
            sb.append(",\"timeNe\":\"").append(esc(n.getTimeNe())).append("\"");
            sb.append(",\"points\":").append(n.getPoints() != null ? n.getPoints() : "null");
            sb.append(",\"createdAt\":\"").append(esc(n.getCreatedAt())).append("\"");
            sb.append("}");
        }
        sb.append("]");
        return sb.toString();
    }

    private String activityJson(List<ActivityTbl> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            ActivityTbl a = list.get(i);
            if (i > 0) sb.append(",");
            sb.append("{\"id\":").append(a.getId());
            sb.append(",\"ownerId\":").append(a.getOwnerId());
            sb.append(",\"activityKey\":\"").append(esc(a.getActivityKey())).append("\"");
            sb.append(",\"icon\":\"").append(esc(a.getIcon())).append("\"");
            sb.append(",\"timeLabel\":\"").append(esc(a.getTimeLabel())).append("\"");
            sb.append(",\"timeNe\":\"").append(esc(a.getTimeNe())).append("\"");
            sb.append(",\"createdAt\":\"").append(esc(a.getCreatedAt())).append("\"");
            sb.append("}");
        }
        sb.append("]");
        return sb.toString();
    }

    private String myPostsJson(List<PostTbl> posts) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < posts.size(); i++) {
            PostTbl p = posts.get(i);
            if (i > 0) sb.append(",");
            sb.append("{\"id\":").append(p.getId());
            sb.append(",\"ownerId\":").append(p.getOwnerId());
            sb.append(",\"userId\":").append(p.getUserId());
            sb.append(",\"type\":\"").append(esc(p.getType())).append("\"");
            sb.append(",\"status\":\"").append(esc(p.getStatus())).append("\"");
            sb.append(",\"title\":\"").append(esc(p.getTitle())).append("\"");
            sb.append(",\"titleNe\":\"").append(esc(p.getTitleNe())).append("\"");
            sb.append(",\"description\":\"").append(esc(p.getDescription())).append("\"");
            sb.append(",\"descriptionNe\":\"").append(esc(p.getDescriptionNe())).append("\"");
            sb.append(",\"location\":\"").append(esc(p.getLocation())).append("\"");
            sb.append(",\"locationNe\":\"").append(esc(p.getLocationNe())).append("\"");
            sb.append(",\"category\":\"").append(esc(p.getCategory())).append("\"");
            sb.append(",\"subcategory\":\"").append(esc(p.getSubcategory())).append("\"");
            sb.append(",\"date\":\"").append(esc(p.getDate())).append("\"");
            sb.append(",\"createdAt\":\"").append(esc(p.getCreatedAt())).append("\"");
            sb.append(",\"image\":\"").append(esc(p.getImage())).append("\"");
            sb.append(",\"userName\":\"").append(esc(p.getUserName())).append("\"");
            sb.append(",\"userAvatar\":\"").append(esc(p.getUserAvatar())).append("\"");
            sb.append(",\"handoverStep\":\"").append(esc(p.getHandoverStep())).append("\"");
            sb.append(",\"deliveredDate\":\"").append(esc(p.getDeliveredDate())).append("\"");
            sb.append(",\"visibleUntil\":\"").append(esc(p.getVisibleUntil())).append("\"");
            if (p.getRetentionDaysLeft() != null) sb.append(",\"retentionDaysLeft\":").append(p.getRetentionDaysLeft());
            else sb.append(",\"retentionDaysLeft\":null");
            sb.append(",\"deliveredMessage\":\"").append(esc(p.getDeliveredMessage())).append("\"");
            sb.append(",\"deliveredMessageNe\":\"").append(esc(p.getDeliveredMessageNe())).append("\"");
            if (p.getRewardPoints() != null) sb.append(",\"rewardPoints\":").append(p.getRewardPoints());
            else sb.append(",\"rewardPoints\":null");
            sb.append("}");
        }
        sb.append("]");
        return sb.toString();
    }

    private String claimsJson(List<ClaimTbl> list) {
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

    /* ══════════════════════════════════════════
       Page routes
       ══════════════════════════════════════════ */

    @GetMapping({"/profile", "/profile.html"})
    public String profile(HttpSession session, Model model) {
        UserTbl user = getUser(session);
        List<PostTbl> myPosts = Collections.emptyList();
        List<ClaimTbl> myClaims = Collections.emptyList();
        if (user != null) {
            myPosts = postRepo.findByOwnerIdOrderByIdDesc(user.getId());
            myClaims = claimRepo.findByOwnerIdOrderByIdDesc(user.getId());
        }
        model.addAttribute("user", user);
        model.addAttribute("myPosts", myPosts);
        model.addAttribute("myPostsJson", myPostsJson(myPosts));
        model.addAttribute("claimsJson", claimsJson(myClaims));
        model.addAttribute("currentPage", "profile");
        addUserJson(user, model);
        return "profile";
    }

    @GetMapping({"/edit-profile", "/edit-profile.html"})
    public String editProfile(HttpSession session, Model model) {
        UserTbl user = getUser(session);
        model.addAttribute("user", user);
        model.addAttribute("currentPage", "edit-profile");
        addUserJson(user, model);
        return "edit-profile";
    }

    @GetMapping({"/settings", "/settings.html"})
    public String settings(HttpSession session, Model model) {
        UserTbl user = getUser(session);
        model.addAttribute("user", user);
        model.addAttribute("currentPage", "settings");
        addUserJson(user, model);
        return "settings";
    }

    @GetMapping({"/change-password", "/change-password.html"})
    public String changePassword(HttpSession session, Model model) {
        UserTbl user = getUser(session);
        model.addAttribute("user", user);
        model.addAttribute("currentPage", "change-password");
        addUserJson(user, model);
        return "change-password";
    }

    @GetMapping({"/kyc", "/kyc.html"})
    public String kyc(HttpSession session, Model model) {
        UserTbl user = getUser(session);
        model.addAttribute("user", user);
        model.addAttribute("currentPage", "kyc");
        addUserJson(user, model);
        return "kyc";
    }

    @GetMapping({"/rewards", "/rewards.html"})
    public String rewards(HttpSession session, Model model) {
        UserTbl user = getUser(session);
        model.addAttribute("user", user);
        model.addAttribute("currentPage", "rewards");
        addUserJson(user, model);
        return "rewards";
    }

    @GetMapping({"/office", "/office.html"})
    public String office(HttpSession session, Model model) {
        UserTbl user = getUser(session);
        model.addAttribute("user", user);
        model.addAttribute("currentPage", "office");
        addUserJson(user, model);
        return "office";
    }

    @GetMapping({"/activity", "/activity.html"})
    public String activity(HttpSession session, Model model) {
        UserTbl user = getUser(session);
        List activities = Collections.emptyList();
        if (user != null) activities = activityRepo.findByOwnerIdOrderByIdDesc(user.getId());
        model.addAttribute("user", user);
        model.addAttribute("activities", activities);
        model.addAttribute("activityJson", activityJson(activities));
        model.addAttribute("currentPage", "activity");
        addUserJson(user, model);
        return "activity";
    }

    @GetMapping({"/notifications", "/notifications.html"})
    public String notifications(HttpSession session, Model model) {
        UserTbl user = getUser(session);
        List notifications = Collections.emptyList();
        if (user != null) notifications = notificationRepo.findByOwnerIdOrderByIdDesc(user.getId());
        model.addAttribute("user", user);
        model.addAttribute("notifications", notifications);
        model.addAttribute("notificationsJson", notificationsJson(notifications));
        model.addAttribute("currentPage", "notifications");
        addUserJson(user, model);
        return "notifications";
    }

    /* ══════════════════════════════════════════
       User API endpoints
       ══════════════════════════════════════════ */

    @PutMapping("/users/me")
    @ResponseBody
    public ResponseEntity<?> updateMe(@RequestBody Map<String, String> body, HttpSession session) {
        UserTbl user = getUser(session);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        userService.updateProfile(user, body);
        return ResponseEntity.ok(userService.safeUser(user));
    }

    @PostMapping("/users/me/kyc")
    @ResponseBody
    public ResponseEntity<?> submitMyKyc(@RequestBody Map<String, String> body, HttpSession session) {
        UserTbl user = getUser(session);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        String currentStatus = user.getKycStatus();
        if ("verified".equalsIgnoreCase(currentStatus))
            return ResponseEntity.badRequest().body(Map.of("error", "KYC already verified"));
        if ("pending".equalsIgnoreCase(currentStatus))
            return ResponseEntity.badRequest().body(Map.of("error", "KYC already under review"));
        String kycFront = body.get("kycFront");
        String kycBack = body.get("kycBack");
        if (kycFront == null || kycFront.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Front document is required"));
        if (kycBack == null || kycBack.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Back document is required"));
        userService.submitKyc(user, kycFront, kycBack);
        Map<String, Object> result = new HashMap<>();
        result.put("status", "pending");
        result.put("message", "KYC submitted successfully. Awaiting admin review.");
        return ResponseEntity.ok(result);
    }

    @PostMapping("/notifications/read-all")
    @ResponseBody
    public ResponseEntity<?> readAllNotifications(HttpSession session) {
        UserTbl user = getUser(session);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked read"));
    }
}
