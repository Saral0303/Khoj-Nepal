package io.virinchi.khojnepal.Controller;

import io.virinchi.khojnepal.Model.ClaimTbl;
import io.virinchi.khojnepal.Model.PostTbl;
import io.virinchi.khojnepal.Model.UserTbl;
import io.virinchi.khojnepal.Repository.ClaimRepository;
import io.virinchi.khojnepal.Repository.PostRepository;
import io.virinchi.khojnepal.Repository.UserRepository;
import io.virinchi.khojnepal.Service.PostService;
import io.virinchi.khojnepal.Service.ReportService;
import io.virinchi.khojnepal.Service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Controller
public class PostController {

    private final PostService postService;
    private final UserService userService;
    private final UserRepository userRepo;
    private final PostRepository postRepo;
    private final ClaimRepository claimRepo;
    private final ReportService reportService;

    public PostController(PostService postService, UserService userService,
                          UserRepository userRepo, PostRepository postRepo,
                          ClaimRepository claimRepo, ReportService reportService) {
        this.postService = postService;
        this.userService = userService;
        this.userRepo = userRepo;
        this.postRepo = postRepo;
        this.claimRepo = claimRepo;
        this.reportService = reportService;
    }

    /* ══════════════════════════════════════════
       Helper methods
       ══════════════════════════════════════════ */

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

    private String postsJson(List<PostTbl> posts) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < posts.size(); i++) {
            PostTbl p = posts.get(i);
            if (i > 0) sb.append(",");
            sb.append("{");
            sb.append("\"id\":").append(p.getId());
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
            sb.append(",\"ownerId\":").append(p.getOwnerId());
            sb.append(",\"userId\":").append(p.getUserId());
            sb.append(",\"handoverStep\":\"").append(esc(p.getHandoverStep())).append("\"");
            sb.append(",\"deliveredDate\":\"").append(esc(p.getDeliveredDate())).append("\"");
            sb.append(",\"visibleUntil\":\"").append(esc(p.getVisibleUntil())).append("\"");
            if (p.getRetentionDaysLeft() != null) {
                sb.append(",\"retentionDaysLeft\":").append(p.getRetentionDaysLeft());
            } else {
                sb.append(",\"retentionDaysLeft\":null");
            }
            sb.append(",\"deliveredMessage\":\"").append(esc(p.getDeliveredMessage())).append("\"");
            sb.append(",\"deliveredMessageNe\":\"").append(esc(p.getDeliveredMessageNe())).append("\"");
            if (p.getRewardPoints() != null) {
                sb.append(",\"rewardPoints\":").append(p.getRewardPoints());
            } else {
                sb.append(",\"rewardPoints\":null");
            }
            sb.append("}");
        }
        sb.append("]");
        return sb.toString();
    }

    /* ══════════════════════════════════════════
       Page routes
       ══════════════════════════════════════════ */

    @GetMapping({"/home", "/home.html"})
    public String home(HttpSession session, Model model) {
        UserTbl user = getUser(session);
        Integer userId = user != null ? user.getId() : null;
        Page<PostTbl> postPage = postService.getVisiblePosts(userId, null, null, null, null, null, null, 0, 20);
        List<PostTbl> postList = postPage.getContent();
        model.addAttribute("user", user);
        model.addAttribute("posts", postList);
        model.addAttribute("postsJson", postsJson(postList));
        model.addAttribute("currentPage", "home");
        addUserJson(user, model);
        return "home";
    }

    @GetMapping({"/lost", "/lost.html"})
    public String lost(HttpSession session, Model model) {
        UserTbl user = getUser(session);
        Integer userId = user != null ? user.getId() : null;
        Page<PostTbl> postPage = postService.getVisiblePosts(userId, "lost", null, null, null, null, null, 0, 20);
        List<PostTbl> postList = postPage.getContent();
        model.addAttribute("user", user);
        model.addAttribute("posts", postList);
        model.addAttribute("postsJson", postsJson(postList));
        model.addAttribute("currentPage", "lost");
        addUserJson(user, model);
        return "lost";
    }

    @GetMapping({"/found", "/found.html"})
    public String found(HttpSession session, Model model) {
        UserTbl user = getUser(session);
        Integer userId = user != null ? user.getId() : null;
        Page<PostTbl> postPage = postService.getVisiblePosts(userId, "found", null, null, null, null, null, 0, 20);
        List<PostTbl> postList = postPage.getContent();
        model.addAttribute("user", user);
        model.addAttribute("posts", postList);
        model.addAttribute("postsJson", postsJson(postList));
        model.addAttribute("currentPage", "found");
        addUserJson(user, model);
        return "found";
    }

    @GetMapping({"/post", "/post.html"})
    public String post(HttpSession session, Model model) {
        addUserJson(getUser(session), model);
        return "post";
    }

    @GetMapping({"/edit-post", "/edit-post.html"})
    public String editPost(HttpSession session, Model model) {
        addUserJson(getUser(session), model);
        return "edit-post";
    }

    @GetMapping({"/item-details", "/item-details.html"})
    public String itemDetails(@RequestParam(value = "id", required = false) Integer id,
                              HttpSession session, Model model) {
        UserTbl user = getUser(session);
        Integer userId = user != null ? user.getId() : null;
        PostTbl post = null;
        List<ClaimTbl> claims = Collections.emptyList();
        if (id != null) {
            post = postService.getVisiblePost(id, userId);
            if (post != null && user != null && "admin".equalsIgnoreCase(user.getRole())) {
                claims = claimRepo.findByPostIdOrderByIdDesc(id);
            }
        }
        model.addAttribute("user", user);
        model.addAttribute("post", post);
        model.addAttribute("claims", claims);
        model.addAttribute("currentPage", "item-details");
        addUserJson(user, model);
        return "item-details";
    }

    /* ══════════════════════════════════════════
       POST / PUT / DELETE API endpoints
       ══════════════════════════════════════════ */

    @PostMapping("/posts")
    @ResponseBody
    public ResponseEntity<?> createPost(@RequestBody PostTbl body, HttpSession session) {
        UserTbl user = getUser(session);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        if (!"user".equalsIgnoreCase(user.getRole()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only community users can post"));
        if (isBlank(body.getTitle()) || isBlank(body.getType()) || isBlank(body.getCategory()))
            return ResponseEntity.badRequest().body(Map.of("error", "Title, type and category are required"));
        if ("found".equalsIgnoreCase(body.getType()) && isBlank(body.getImage()))
            return ResponseEntity.badRequest().body(Map.of("error", "Found posts require a photo"));

        PostTbl post = postService.createPost(user, body);
        userService.incrementItemsReported(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    @PutMapping("/posts/{id}")
    @ResponseBody
    public ResponseEntity<?> updatePost(@PathVariable int id, @RequestBody PostTbl body, HttpSession session) {
        UserTbl user = getUser(session);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        PostTbl existing = postService.getVisiblePost(id, user.getId());
        if (existing == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Post not found"));
        if (existing.getOwnerId() != user.getId())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not your post"));
        return ResponseEntity.ok(postService.updatePost(existing, body));
    }

    @DeleteMapping("/posts/{id}")
    @ResponseBody
    public ResponseEntity<?> deletePost(@PathVariable int id, HttpSession session) {
        UserTbl user = getUser(session);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        PostTbl post = postService.getVisiblePost(id, user.getId());
        if (post == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Post not found"));
        if (post.getOwnerId() != user.getId() && !"admin".equalsIgnoreCase(user.getRole()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not allowed"));
        postService.deletePost(post);
        return ResponseEntity.ok(Map.of("message", "Post deleted"));
    }

    @PostMapping("/posts/{postId}/tips")
    @ResponseBody
    public ResponseEntity<?> createTip(@PathVariable int postId, @RequestBody Map<String, String> body, HttpSession session) {
        UserTbl user = getUser(session);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        var tip = reportService.createTip(postId, user,
                body.getOrDefault("infoType", "other"),
                body.getOrDefault("message", ""));
        if (tip == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Post not found"));
        return ResponseEntity.status(HttpStatus.CREATED).body(tip);
    }

    @PostMapping("/reports")
    @ResponseBody
    public ResponseEntity<?> createReport(@RequestBody Map<String, Object> body, HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        UserTbl user = userId != null ? userRepo.findById(userId).orElse(null) : null;
        var report = reportService.createReport(user,
                str(body.get("targetType"), "other"),
                body.get("targetId"),
                str(body.get("reason"), ""),
                str(body.get("description"), ""),
                str(body.get("image"), null));
        return ResponseEntity.status(HttpStatus.CREATED).body(report);
    }

    /* ══════════════════════════════════════════
       Image upload
       ══════════════════════════════════════════ */

    @org.springframework.beans.factory.annotation.Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @org.springframework.beans.factory.annotation.Value("${app.upload.url-prefix:/uploads/}")
    private String urlPrefix;

    @PostMapping("/upload")
    @ResponseBody
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
        }
        String allowed = ".jpg,.jpeg,.png,.gif,.webp,.pdf";
        if (!allowed.contains(ext))
            return ResponseEntity.badRequest().body(Map.of("error", "File type not allowed. Allowed: " + allowed));
        try {
            Path dir = Paths.get(uploadDir);
            if (!Files.exists(dir)) Files.createDirectories(dir);
            String filename = UUID.randomUUID() + ext;
            Path target = dir.resolve(filename);
            file.transferTo(target.toFile());
            String url = urlPrefix + filename;
            return ResponseEntity.ok(Map.of("url", url, "filename", filename, "size", file.getSize()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }

    @DeleteMapping("/upload/{filename}")
    @ResponseBody
    public ResponseEntity<?> deleteFile(@PathVariable String filename) {
        try {
            Path file = Paths.get(uploadDir).resolve(filename);
            if (Files.exists(file)) {
                Files.delete(file);
                return ResponseEntity.ok(Map.of("message", "File deleted"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "File not found"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Delete failed: " + e.getMessage()));
        }
    }

    /* ══════════════════════════════════════════
       Small helpers
       ══════════════════════════════════════════ */

    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
    private String str(Object v, String fallback) {
        if (v == null) return fallback;
        String s = v.toString();
        return s.isBlank() ? fallback : s;
    }
}
