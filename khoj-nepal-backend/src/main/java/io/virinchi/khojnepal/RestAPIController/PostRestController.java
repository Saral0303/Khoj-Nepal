package io.virinchi.khojnepal.RestAPIController;

import io.virinchi.khojnepal.Model.PostTbl;
import io.virinchi.khojnepal.Model.UserTbl;
import io.virinchi.khojnepal.Service.PostService;
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
@RequestMapping("/api/posts")
public class PostRestController {

    private final PostService postService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> listPosts(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String subcategory,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        Integer userId = (Integer) session.getAttribute("userId");
        return ResponseEntity.ok(postService.getVisiblePosts(userId, type, category, subcategory, location, query, date, page, size));
    }

    @GetMapping("/mine")
    public ResponseEntity<?> myPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        UserTbl user = requireUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }
        return ResponseEntity.ok(postService.getMyPosts(user.getId(), page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable int id, HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        PostTbl post = postService.getVisiblePost(id, userId);
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Post not found"));
        }
        return ResponseEntity.ok(post);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody PostTbl body, HttpSession session) {
        UserTbl user = requireUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }
        if (!"user".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only community users can post"));
        }
        if (isBlank(body.getTitle()) || isBlank(body.getType()) || isBlank(body.getCategory())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title, type and category are required"));
        }
        if ("found".equalsIgnoreCase(body.getType()) && isBlank(body.getImage())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Found posts require a photo"));
        }

        PostTbl post = postService.createPost(user, body);
        userService.incrementItemsReported(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody PostTbl body, HttpSession session) {
        UserTbl user = requireUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }

        PostTbl existing = postService.getVisiblePost(id, user.getId());
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Post not found"));
        }
        if (existing.getOwnerId() != user.getId()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not your post"));
        }

        return ResponseEntity.ok(postService.updatePost(existing, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id, HttpSession session) {
        UserTbl user = requireUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }

        PostTbl post = postService.getVisiblePost(id, user.getId());
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Post not found"));
        }
        if (post.getOwnerId() != user.getId() && !"admin".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not allowed"));
        }

        postService.deletePost(post);
        return ResponseEntity.ok(Map.of("message", "Post deleted"));
    }

    private UserTbl requireUser(HttpSession session) {
        Object idObj = session.getAttribute("userId");
        if (idObj == null) return null;
        return userService.findById((Integer) idObj).orElse(null);
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
