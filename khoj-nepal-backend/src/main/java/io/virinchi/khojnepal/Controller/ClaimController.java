package io.virinchi.khojnepal.Controller;

import io.virinchi.khojnepal.Model.ClaimTbl;
import io.virinchi.khojnepal.Model.PostTbl;
import io.virinchi.khojnepal.Model.UserTbl;
import io.virinchi.khojnepal.Repository.ClaimRepository;
import io.virinchi.khojnepal.Repository.PostRepository;
import io.virinchi.khojnepal.Repository.UserRepository;
import io.virinchi.khojnepal.Service.ClaimService;
import io.virinchi.khojnepal.Service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
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
public class ClaimController {

    private final UserRepository userRepo;
    private final PostRepository postRepo;
    private final ClaimRepository claimRepo;
    private final ClaimService claimService;
    private final UserService userService;

    /* ──────── helpers ──────── */

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

    /* ──────── page routes ──────── */

    @GetMapping({"/claim", "/claim.html"})
    public String claim(HttpSession session, Model model) {
        UserTbl user = getUser(session);
        List<ClaimTbl> myClaims = Collections.emptyList();
        if (user != null) {
            myClaims = claimRepo.findByOwnerIdOrderByIdDesc(user.getId());
        }
        model.addAttribute("user", user);
        model.addAttribute("claimsJson", claimsJson(myClaims));
        addUserJson(user, model);
        return "claim";
    }

    @GetMapping({"/have-info", "/have-info.html"})
    public String haveInfo(HttpSession session, Model model) {
        addUserJson(getUser(session), model);
        return "have-info";
    }

    /* ──────── API endpoints ──────── */

    @PostMapping("/claims")
    @ResponseBody
    public ResponseEntity<?> createClaim(@RequestBody Map<String, Object> body, HttpSession session) {
        UserTbl user = getUser(session);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));

        Object postIdObj = body.get("postId");
        if (postIdObj == null) return ResponseEntity.badRequest().body(Map.of("error", "postId required"));

        int postId = Integer.parseInt(postIdObj.toString());
        PostTbl post = postRepo.findById(postId).orElse(null);
        if (post == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Post not found"));
        if (post.getOwnerId() == user.getId())
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot claim your own post"));
        if (!"verified".equalsIgnoreCase(user.getKycStatus()))
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "KYC verification required before claiming",
                    "kycStatus", user.getKycStatus() != null ? user.getKycStatus() : "none"));
        if (!claimService.canClaim(user, post)) {
            long daysLeft = claimService.getDaysLeftToClaim(post);
            if (daysLeft > 0)
                return ResponseEntity.badRequest().body(Map.of("error", "Claims open after 7 days", "daysLeft", daysLeft));
            return ResponseEntity.badRequest().body(Map.of("error", "Post is not open for claims"));
        }
        ClaimTbl claim = claimService.createClaim(user, post, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(claim);
    }
}
