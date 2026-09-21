package io.virinchi.khojnepal.Service;

import io.virinchi.khojnepal.Model.PostTbl;
import io.virinchi.khojnepal.Model.UserTbl;
import io.virinchi.khojnepal.Repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository pRepo;
    private final NotificationService notificationService;
    private final TranslationService translationService;

    public Page<PostTbl> getVisiblePosts(Integer userId, String type, String category,
                                         String subcategory, String location,
                                         String query, String date,
                                         int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));

        List<String> visibleStatuses = new ArrayList<>();
        visibleStatuses.add("active");
        visibleStatuses.add("claim_pending");
        visibleStatuses.add("under_verification");
        visibleStatuses.add("received_by_admin");
        visibleStatuses.add("delivered");
        visibleStatuses.add("owner_found");
        visibleStatuses.add("suspicious");
        visibleStatuses.add("archived");
        visibleStatuses.add("pending");

        Page<PostTbl> postPage;
        if (type != null && !type.isBlank()) {
            postPage = pRepo.findByType(type, pageable);
        } else {
            postPage = pRepo.findByStatusIn(visibleStatuses, pageable);
        }

        List<PostTbl> filtered = postPage.getContent().stream()
                .filter(post -> {
                    if ("rejected".equalsIgnoreCase(post.getStatus())) return false;
                    if ("pending".equalsIgnoreCase(post.getStatus())) {
                        return userId != null && post.getOwnerId() == userId;
                    }
                    return true;
                })
                .filter(post -> category == null || category.isBlank() || category.equalsIgnoreCase(post.getCategory()))
                .filter(post -> subcategory == null || subcategory.isBlank() || subcategory.equalsIgnoreCase(post.getSubcategory()))
                .filter(post -> date == null || date.isBlank() || date.equals(post.getDate()))
                .filter(post -> location == null || location.isBlank()
                        || containsIgnore(post.getLocation(), location)
                        || containsIgnore(post.getLocationNe(), location))
                .filter(post -> query == null || query.isBlank()
                        || containsIgnore(post.getTitle(), query)
                        || containsIgnore(post.getTitleNe(), query)
                        || containsIgnore(post.getDescription(), query)
                        || containsIgnore(post.getLocation(), query))
                .collect(Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(filtered, pageable, postPage.getTotalElements());
    }

    public Page<PostTbl> getMyPosts(int userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return pRepo.findByOwnerId(userId, pageable);
    }

    public PostTbl getVisiblePost(int id, Integer userId) {
        return pRepo.findById(id).filter(post -> {
            if ("rejected".equalsIgnoreCase(post.getStatus())) return false;
            if ("pending".equalsIgnoreCase(post.getStatus())) {
                return userId != null && post.getOwnerId() == userId;
            }
            return true;
        }).orElse(null);
    }

    public PostTbl createPost(UserTbl user, PostTbl body) {
        PostTbl post = new PostTbl();
        post.setOwnerId(user.getId());
        post.setUserId(user.getId());
        post.setOwner(user);
        post.setUser(user);
        post.setUserName(user.getFullName());
        post.setUserAvatar(avatarFrom(user.getFullName()));
        post.setType(body.getType().toLowerCase(Locale.ROOT));
        post.setStatus("pending");
        post.setTitle(body.getTitle());
        post.setTitleNe(body.getTitleNe());
        post.setDescription(body.getDescription());
        post.setDescriptionNe(body.getDescriptionNe());
        post.setLocation(body.getLocation());
        post.setLocationNe(body.getLocationNe());
        post.setCategory(body.getCategory());
        post.setSubcategory(body.getSubcategory());
        post.setDate(body.getDate() != null ? body.getDate() : LocalDate.now().toString());
        post.setCreatedAt(LocalDate.now().toString());
        post.setImage(body.getImage());
        if ("found".equalsIgnoreCase(post.getType())) {
            post.setHandoverStep("reported");
        }

        translationService.fillBilingualFields(post);
        pRepo.save(post);

        notificationService.addActivity(user.getId(), "post_created", "post");
        notificationService.addNotification(user.getId(), "post_pending", "post", null);
        return post;
    }

    public PostTbl updatePost(PostTbl post, PostTbl body) {
        if (body.getTitle() != null && !body.getTitle().isBlank()) post.setTitle(body.getTitle());
        if (body.getTitleNe() != null) post.setTitleNe(body.getTitleNe());
        if (body.getDescription() != null) post.setDescription(body.getDescription());
        if (body.getDescriptionNe() != null) post.setDescriptionNe(body.getDescriptionNe());
        if (body.getLocation() != null) post.setLocation(body.getLocation());
        if (body.getLocationNe() != null) post.setLocationNe(body.getLocationNe());
        if (body.getCategory() != null) post.setCategory(body.getCategory());
        if (body.getSubcategory() != null) post.setSubcategory(body.getSubcategory());
        if (body.getDate() != null) post.setDate(body.getDate());
        if (body.getImage() != null) post.setImage(body.getImage());
        translationService.fillBilingualFields(post);
        return pRepo.save(post);
    }

    public boolean deletePost(PostTbl post) {
        pRepo.deleteById(post.getId());
        return true;
    }

    public PostTbl approvePost(PostTbl post) {
        post.setStatus("active");
        pRepo.save(post);
        notificationService.addNotification(post.getOwnerId(), "post_approved", "post", null);
        return post;
    }

    public PostTbl rejectPost(PostTbl post) {
        post.setStatus("rejected");
        pRepo.save(post);
        notificationService.addNotification(post.getOwnerId(), "post_rejected", "post", null);
        return post;
    }

    public PostTbl updateStatus(PostTbl post, String status, String handoverStep) {
        post.setStatus(status);
        if (handoverStep != null) {
            post.setHandoverStep(handoverStep);
        }
        return pRepo.save(post);
    }

    private boolean containsIgnore(String source, String query) {
        if (source == null || query == null) return false;
        return source.toLowerCase(Locale.ROOT).contains(query.toLowerCase(Locale.ROOT));
    }

    private String avatarFrom(String name) {
        if (name == null || name.isBlank()) return "KN";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase(Locale.ROOT);
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase(Locale.ROOT);
    }
}
