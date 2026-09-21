package io.virinchi.khojnepal.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Serves Khoj Nepal HTML pages from templates/ (same URLs as the original frontend).
 */
@Controller
public class PageController {

    @GetMapping({"/", "/index", "/index.html"})
    public String index() {
        return "redirect:/welcome";
    }

    @GetMapping({"/welcome", "/welcome.html"})
    public String welcome() { return "welcome"; }

    @GetMapping({"/login", "/login.html"})
    public String login() { return "login"; }

    @GetMapping({"/signup", "/signup.html"})
    public String signup() { return "signup"; }

    @GetMapping({"/forgot-password", "/forgot-password.html"})
    public String forgotPassword() { return "forgot-password"; }

    @GetMapping({"/home", "/home.html"})
    public String home() { return "home"; }

    @GetMapping({"/lost", "/lost.html"})
    public String lost() { return "lost"; }

    @GetMapping({"/found", "/found.html"})
    public String found() { return "found"; }

    @GetMapping({"/post", "/post.html"})
    public String post() { return "post"; }

    @GetMapping({"/edit-post", "/edit-post.html"})
    public String editPost() { return "edit-post"; }

    @GetMapping({"/item-details", "/item-details.html"})
    public String itemDetails() { return "item-details"; }

    @GetMapping({"/claim", "/claim.html"})
    public String claim() { return "claim"; }

    @GetMapping({"/have-info", "/have-info.html"})
    public String haveInfo() { return "have-info"; }

    @GetMapping({"/activity", "/activity.html"})
    public String activity() { return "activity"; }

    @GetMapping({"/notifications", "/notifications.html"})
    public String notifications() { return "notifications"; }

    @GetMapping({"/profile", "/profile.html"})
    public String profile() { return "profile"; }

    @GetMapping({"/edit-profile", "/edit-profile.html"})
    public String editProfile() { return "edit-profile"; }

    @GetMapping({"/rewards", "/rewards.html"})
    public String rewards() { return "rewards"; }

    @GetMapping({"/office", "/office.html"})
    public String office() { return "office"; }

    @GetMapping({"/settings", "/settings.html"})
    public String settings() { return "settings"; }

    @GetMapping({"/change-password", "/change-password.html"})
    public String changePassword() { return "change-password"; }

    @GetMapping({"/kyc", "/kyc.html"})
    public String kyc() { return "kyc"; }

    @GetMapping({"/help", "/help.html"})
    public String help() { return "help"; }

    @GetMapping({"/how-it-works", "/how-it-works.html"})
    public String howItWorks() { return "how-it-works"; }

    @GetMapping({"/privacy", "/privacy.html"})
    public String privacy() { return "privacy"; }

    @GetMapping({"/terms", "/terms.html"})
    public String terms() { return "terms"; }

    /* ---- Admin pages ---- */

    @GetMapping({"/admin", "/admin/", "/admin/dashboard", "/admin/dashboard.html"})
    public String adminDashboard() { return "admin/dashboard"; }

    @GetMapping({"/admin/login", "/admin/login.html"})
    public String adminLogin() { return "admin/login"; }

    @GetMapping({"/admin/posts", "/admin/posts.html"})
    public String adminPosts() { return "admin/posts"; }

    @GetMapping({"/admin/lost", "/admin/lost.html"})
    public String adminLost() { return "admin/lost"; }

    @GetMapping({"/admin/found", "/admin/found.html"})
    public String adminFound() { return "admin/found"; }

    @GetMapping({"/admin/claims", "/admin/claims.html"})
    public String adminClaims() { return "admin/claims"; }

    @GetMapping({"/admin/verification", "/admin/verification.html"})
    public String adminVerification() { return "admin/verification"; }

    @GetMapping({"/admin/suspicious", "/admin/suspicious.html"})
    public String adminSuspicious() { return "admin/suspicious"; }

    @GetMapping({"/admin/users", "/admin/users.html"})
    public String adminUsers() { return "admin/users"; }

    @GetMapping({"/admin/recovered", "/admin/recovered.html"})
    public String adminRecovered() { return "admin/recovered"; }

    @GetMapping({"/admin/rewards", "/admin/rewards.html"})
    public String adminRewards() { return "admin/rewards"; }

    @GetMapping({"/admin/reports", "/admin/reports.html"})
    public String adminReports() { return "admin/reports"; }

    @GetMapping({"/admin/settings", "/admin/settings.html"})
    public String adminSettings() { return "admin/settings"; }

    @GetMapping({"/admin/post-detail", "/admin/post-detail.html"})
    public String adminPostDetail() { return "admin/post-detail"; }
}
