package io.virinchi.khojnepal.Service;

import io.virinchi.khojnepal.Model.ClaimTbl;
import io.virinchi.khojnepal.Model.PostTbl;
import io.virinchi.khojnepal.Model.UserTbl;
import io.virinchi.khojnepal.Repository.ClaimRepository;
import io.virinchi.khojnepal.Repository.PostRepository;
import io.virinchi.khojnepal.Repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@Service
public class ClaimService {

    private final ClaimRepository cRepo;
    private final PostRepository pRepo;
    private final UserRepository uRepo;
    private final NotificationService notificationService;

    public ClaimService(ClaimRepository cRepo, PostRepository pRepo,
                        UserRepository uRepo, NotificationService notificationService) {
        this.cRepo = cRepo;
        this.pRepo = pRepo;
        this.uRepo = uRepo;
        this.notificationService = notificationService;
    }

    public Page<ClaimTbl> getMyClaims(int userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return cRepo.findByOwnerId(userId, pageable);
    }

    public ClaimTbl getClaim(int id, UserTbl user) {
        ClaimTbl claim = cRepo.findById(id).orElse(null);
        if (claim == null) return null;
        boolean isAdmin = "admin".equalsIgnoreCase(user.getRole());
        if (!isAdmin && claim.getOwnerId() != user.getId()) return null;
        return claim;
    }

    public ClaimTbl createClaim(UserTbl user, PostTbl post, Map<String, Object> body) {
        ClaimTbl claim = new ClaimTbl();
        claim.setOwnerId(user.getId());
        claim.setPostId(post.getId());
        claim.setClaimant(user);
        claim.setPost(post);
        claim.setItemTitle(post.getTitle());
        claim.setStatus("under_review");
        claim.setInvestigation("normal");
        claim.setDayOfSeven(7);
        claim.setSubmittedDate(LocalDate.now().toString());
        claim.setClaimantName(str(body.get("claimantName"), user.getFullName()));
        claim.setClaimantPhone(str(body.get("claimantPhone"), user.getMobile()));
        claim.setClaimantEmail(str(body.get("claimantEmail"), user.getEmail()));
        claim.setClaimantAddress(str(body.get("claimantAddress"), ""));
        claim.setOwnership(str(body.get("ownership"), ""));
        claim.setKycFront(str(body.get("kycFront"), null));
        claim.setKycBack(str(body.get("kycBack"), null));
        claim.setProofImage(str(body.get("proofImage"), null));
        claim.setKycVerified(false);
        claim.setNotes("");
        claim.setHistoryJson("[{\"date\":\"" + LocalDate.now() + "\",\"key\":\"histClaimSubmitted\"}]");
        cRepo.save(claim);

        post.setStatus("claim_pending");
        pRepo.save(post);

        notificationService.addActivity(user.getId(), "claim_submitted", "claim");
        notificationService.addNotification(user.getId(), "claim_submitted", "claim", null);
        notificationService.addNotification(post.getOwnerId(), "claim_on_your_post", "claim", null);
        return claim;
    }

    public boolean canClaim(UserTbl user, PostTbl post) {
        if (!"found".equalsIgnoreCase(post.getType())) return false;
        if (!"active".equalsIgnoreCase(post.getStatus()) && !"claim_pending".equalsIgnoreCase(post.getStatus())) return false;
        if (post.getOwnerId() == user.getId()) return false;

        boolean alreadyClaimed = cRepo.findByPostIdOrderByIdDesc(post.getId()).stream()
                .anyMatch(c -> c.getOwnerId() == user.getId()
                        && !"rejected".equalsIgnoreCase(c.getStatus()));
        if (alreadyClaimed) return false;

        try {
            LocalDate posted = LocalDate.parse(post.getDate());
            long days = ChronoUnit.DAYS.between(posted, LocalDate.now());
            if (days < 7) return false;
        } catch (Exception ignored) {
        }
        return true;
    }

    public long getDaysLeftToClaim(PostTbl post) {
        try {
            LocalDate posted = LocalDate.parse(post.getDate());
            long days = ChronoUnit.DAYS.between(posted, LocalDate.now());
            return Math.max(0, 7 - days);
        } catch (Exception e) {
            return 0;
        }
    }

    public ClaimTbl verifyKyc(ClaimTbl claim) {
        claim.setKycVerified(true);
        claim.setStatus("under_investigation");
        appendHistory(claim, "histKycVerified");
        cRepo.save(claim);
        notificationService.addNotification(claim.getOwnerId(), "kyc_verified", "claim", null);
        return claim;
    }

    public ClaimTbl requestMoreInfo(ClaimTbl claim, String adminMessage) {
        claim.setStatus("additional_info");
        claim.setAdminMessage(adminMessage);
        appendHistory(claim, "histMoreInfo");
        cRepo.save(claim);
        notificationService.addNotification(claim.getOwnerId(), "claim_more_info", "claim", null);
        return claim;
    }

    public ClaimTbl flagClaim(ClaimTbl claim) {
        claim.setStatus("suspicious");
        claim.setInvestigation("suspicious");
        appendHistory(claim, "histFlagged");
        cRepo.save(claim);
        PostTbl post = claim.getPost();
        if (post != null) {
            post.setStatus("suspicious");
            pRepo.save(post);
        }
        return claim;
    }

    public ClaimTbl rejectClaim(ClaimTbl claim, String adminMessage) {
        claim.setStatus("rejected");
        claim.setResolvedDate(LocalDate.now().toString());
        if (adminMessage != null) {
            claim.setAdminMessage(adminMessage);
        }
        appendHistory(claim, "histRejected");
        cRepo.save(claim);
        notificationService.addNotification(claim.getOwnerId(), "claim_rejected", "claim", null);
        return claim;
    }

    public ClaimTbl approveClaim(ClaimTbl claim) {
        claim.setStatus("approved");
        claim.setInvestigation("resolved");
        claim.setResolvedDate(LocalDate.now().toString());
        appendHistory(claim, "histApproved");
        cRepo.save(claim);

        PostTbl post = claim.getPost();
        if (post != null) {
            post.setStatus("delivered");
            post.setHandoverStep("delivered");
            post.setDeliveredDate(LocalDate.now().toString());
            post.setRewardPoints(100);
            post.setVisibleUntil(LocalDate.now().plusDays(14).toString());
            post.setRetentionDaysLeft(14);
            pRepo.save(post);

            UserTbl finder = post.getOwner();
            if (finder != null) {
                finder.setPoints(finder.getPoints() + 100);
                finder.setItemsReturned(finder.getItemsReturned() + 1);
                uRepo.save(finder);
                notificationService.addNotification(finder.getId(), "reward_earned", "reward", 100);
                notificationService.addActivity(finder.getId(), "item_returned", "reward");
            }
        }

        notificationService.addNotification(claim.getOwnerId(), "claim_approved", "claim", null);
        return claim;
    }

    private void appendHistory(ClaimTbl claim, String key) {
        String entry = "{\"date\":\"" + LocalDate.now() + "\",\"key\":\"" + key + "\"}";
        String history = claim.getHistoryJson();
        if (history == null || history.isBlank()) {
            claim.setHistoryJson("[" + entry + "]");
        } else if (history.endsWith("]")) {
            String trimmed = history.substring(0, history.length() - 1);
            if (trimmed.endsWith("[")) {
                claim.setHistoryJson("[" + entry + "]");
            } else {
                claim.setHistoryJson(trimmed + "," + entry + "]");
            }
        }
    }

    private String str(Object value, String fallback) {
        if (value == null) return fallback;
        String s = value.toString();
        return s.isBlank() ? fallback : s;
    }
}
