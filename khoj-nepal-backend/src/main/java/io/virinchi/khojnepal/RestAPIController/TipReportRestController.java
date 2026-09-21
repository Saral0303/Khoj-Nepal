package io.virinchi.khojnepal.RestAPIController;

import io.virinchi.khojnepal.Model.UserTbl;
import io.virinchi.khojnepal.Service.ReportService;
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
@RequestMapping("/api")
public class TipReportRestController {

    private final ReportService reportService;
    private final UserService userService;

    @PostMapping("/posts/{postId}/tips")
    public ResponseEntity<?> createTip(@PathVariable int postId, @RequestBody Map<String, String> body, HttpSession session) {
        UserTbl user = requireUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }

        var tip = reportService.createTip(postId, user,
                body.getOrDefault("infoType", "other"),
                body.getOrDefault("message", ""));
        if (tip == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Post not found"));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(tip);
    }

    @PostMapping("/reports")
    public ResponseEntity<?> createReport(@RequestBody Map<String, Object> body, HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        UserTbl user = userId != null ? userService.findById(userId).orElse(null) : null;

        var report = reportService.createReport(user,
                str(body.get("targetType"), "other"),
                body.get("targetId"),
                str(body.get("reason"), ""),
                str(body.get("description"), ""),
                str(body.get("image"), null));
        return ResponseEntity.status(HttpStatus.CREATED).body(report);
    }

    private UserTbl requireUser(HttpSession session) {
        Object idObj = session.getAttribute("userId");
        if (idObj == null) return null;
        return userService.findById((Integer) idObj).orElse(null);
    }

    private String str(Object value, String fallback) {
        if (value == null) return fallback;
        String s = value.toString();
        return s.isBlank() ? fallback : s;
    }
}
