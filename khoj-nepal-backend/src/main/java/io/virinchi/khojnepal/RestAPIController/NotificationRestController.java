package io.virinchi.khojnepal.RestAPIController;

import io.virinchi.khojnepal.Model.UserTbl;
import io.virinchi.khojnepal.Service.NotificationService;
import io.virinchi.khojnepal.Service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class NotificationRestController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationRestController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> notifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        UserTbl user = requireUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId(), page, size));
    }

    @PostMapping("/notifications/read-all")
    public ResponseEntity<?> readAll(HttpSession session) {
        UserTbl user = requireUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked read"));
    }

    @GetMapping("/activity")
    public ResponseEntity<?> activity(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        UserTbl user = requireUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }
        return ResponseEntity.ok(notificationService.getUserActivity(user.getId(), page, size));
    }

    private UserTbl requireUser(HttpSession session) {
        Object idObj = session.getAttribute("userId");
        if (idObj == null) return null;
        return userService.findById((Integer) idObj).orElse(null);
    }
}
