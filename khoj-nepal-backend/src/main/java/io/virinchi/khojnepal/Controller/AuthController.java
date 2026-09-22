package io.virinchi.khojnepal.Controller;

import io.virinchi.khojnepal.Model.UserTbl;
import io.virinchi.khojnepal.Service.OtpService;
import io.virinchi.khojnepal.Service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final OtpService otpService;
    private final JavaMailSender jms;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    /* ──────── Page routes ──────── */

    @GetMapping({"/", "/index", "/index.html"})
    public String index() { return "redirect:/welcome"; }

    @GetMapping({"/welcome", "/welcome.html"})
    public String welcome() { return "welcome"; }

    @GetMapping({"/login", "/login.html"})
    public String loginPage() { return "login"; }

    @GetMapping({"/signup", "/signup.html"})
    public String signupPage() { return "signup"; }

    @GetMapping({"/forgot-password", "/forgot-password.html"})
    public String forgotPasswordPage() { return "forgot-password"; }

    @GetMapping({"/help", "/help.html"})
    public String help() { return "help"; }

    @GetMapping({"/how-it-works", "/how-it-works.html"})
    public String howItWorks() { return "how-it-works"; }

    @GetMapping({"/privacy", "/privacy.html"})
    public String privacy() { return "privacy"; }

    @GetMapping({"/terms", "/terms.html"})
    public String terms() { return "terms"; }

    /* ──────── API endpoints (used by JS via fetch) ──────── */

    @PostMapping("/auth/login")
    @ResponseBody
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpSession session) {
        String identifier = body.get("identifier");
        String password = body.get("password");
        if (isBlank(identifier) || isBlank(password)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Identifier and password required"));
        }
        var found = userService.login(identifier, password);
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid login"));
        }
        UserTbl user = found.get();
        if ("admin".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Admin accounts must use admin login"));
        }
        session.setAttribute("userId", user.getId());
        session.setAttribute("role", user.getRole());
        sendLoginEmail(user, "community");
        return ResponseEntity.ok(userService.safeUser(user));
    }

    @PostMapping("/auth/admin/login")
    @ResponseBody
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> body, HttpSession session) {
        String identifier = body.get("identifier");
        String password = body.get("password");
        if (isBlank(identifier) || isBlank(password)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Identifier and password required"));
        }
        var found = userService.adminLogin(identifier, password);
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid login"));
        }
        UserTbl user = found.get();
        session.setAttribute("userId", user.getId());
        session.setAttribute("role", user.getRole());
        sendLoginEmail(user, "admin");
        return ResponseEntity.ok(userService.safeUser(user));
    }

    @PostMapping("/auth/register")
    @ResponseBody
    public ResponseEntity<?> register(@RequestBody Map<String, String> body, HttpSession session) {
        String fullName = body.get("fullName");
        String username = body.get("username");
        String email = body.get("email");
        String mobile = body.get("mobile");
        String password = body.get("password");

        if (isBlank(username) || isBlank(email) || isBlank(mobile) || isBlank(password) || isBlank(fullName)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
        }
        if (password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }
        if (userService.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already taken"));
        }
        if (userService.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }
        if (userService.existsByMobile(mobile)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mobile already registered"));
        }

        UserTbl user = userService.register(fullName, username, email, mobile, password,
                body.get("dateOfBirth"), body.get("gender"), body.get("province"),
                body.get("district"), body.get("city"), body.get("profilePicture"));

        session.setAttribute("userId", user.getId());
        session.setAttribute("role", user.getRole());
        sendSignupEmail(user);
        return ResponseEntity.ok(userService.safeUser(user));
    }

    @PostMapping("/auth/logout")
    @ResponseBody
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    @GetMapping("/auth/me")
    @ResponseBody
    public ResponseEntity<?> me(HttpSession session) {
        UserTbl user = currentUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }
        return ResponseEntity.ok(userService.safeUser(user));
    }

    @PostMapping("/auth/forgot-password")
    @ResponseBody
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String identifier = body.get("identifier");
        String newPassword = body.get("newPassword");
        if (isBlank(identifier) || isBlank(newPassword) || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Valid identifier and new password required"));
        }
        if (!userService.resetPassword(identifier, newPassword)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }
        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    @PostMapping("/auth/change-password")
    @ResponseBody
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body, HttpSession session) {
        UserTbl user = currentUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");
        if (isBlank(currentPassword) || isBlank(newPassword) || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Valid passwords required"));
        }
        if (!userService.changePassword(user, currentPassword, newPassword)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Current password incorrect"));
        }
        return ResponseEntity.ok(Map.of("message", "Password changed"));
    }

    /* ──────── helpers ──────── */

    private UserTbl currentUser(HttpSession session) {
        Object idObj = session.getAttribute("userId");
        if (idObj == null) return null;
        return userService.findById((Integer) idObj).orElse(null);
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private void sendSignupEmail(UserTbl user) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (!isBlank(mailFrom)) message.setFrom(mailFrom);
            message.setTo(user.getEmail());
            message.setSubject("Welcome to Khoj Nepal — Signup Successful");
            message.setText(
                    "Namaste " + user.getFullName() + "!\n\n"
                            + "Congratulations! Your Khoj Nepal account was created successfully.\n\n"
                            + "Username: @" + user.getUsername() + "\n"
                            + "Email: " + user.getEmail() + "\n\n"
                            + "You are now logged in. Start helping Nepal find what matters.\n\n"
                            + "— Khoj Nepal Team\n"
                            + "http://localhost:9090/home"
            );
            jms.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send signup email: " + e.getMessage());
        }
    }

    private void sendLoginEmail(UserTbl user, String loginType) {
        try {
            if (isBlank(user.getEmail())) return;
            SimpleMailMessage message = new SimpleMailMessage();
            if (!isBlank(mailFrom)) message.setFrom(mailFrom);
            message.setTo(user.getEmail());
            message.setSubject("Khoj Nepal — New Sign-In Alert");
            message.setText(
                    "Namaste " + user.getFullName() + "!\n\n"
                            + "You just signed in to Khoj Nepal"
                            + ("admin".equals(loginType) ? " (Admin panel)" : "")
                            + ".\n\n"
                            + "Username: @" + user.getUsername() + "\n"
                            + "Email: " + user.getEmail() + "\n"
                            + "Time: " + java.time.LocalDateTime.now() + "\n\n"
                            + "If this was you, you can ignore this email.\n"
                            + "If you did not sign in, please change your password right away.\n\n"
                            + "— Khoj Nepal Team\n"
                            + ("admin".equals(loginType)
                                ? "http://localhost:9090/admin/dashboard"
                                : "http://localhost:9090/home")
            );
            jms.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send login email: " + e.getMessage());
        }
    }

    /* ──────── OTP endpoints ──────── */

    @PostMapping("/auth/send-otp")
    @ResponseBody
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String purpose = body.getOrDefault("purpose", "signup");
        if (isBlank(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        if ("forgot-password".equals(purpose) && !userService.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "No account found with this email"));
        }
        otpService.generateAndSend(email, purpose);
        return ResponseEntity.ok(Map.of("message", "OTP sent to " + email));
    }

    @PostMapping("/auth/verify-otp")
    @ResponseBody
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");
        String purpose = body.getOrDefault("purpose", "signup");
        if (isBlank(email) || isBlank(code)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and code are required"));
        }
        boolean valid = otpService.verify(email, purpose, code);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid or expired code"));
        }
        return ResponseEntity.ok(Map.of("message", "Email verified"));
    }
}
