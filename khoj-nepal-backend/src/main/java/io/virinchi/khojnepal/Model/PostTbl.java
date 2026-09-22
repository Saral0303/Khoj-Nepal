package io.virinchi.khojnepal.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "post_tbl", indexes = {
        @Index(name = "idx_post_status", columnList = "status"),
        @Index(name = "idx_post_ownerId", columnList = "ownerId"),
        @Index(name = "idx_post_type", columnList = "type")
})
public class PostTbl {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(insertable = true, updatable = true)
    private int ownerId;

    @Column(insertable = true, updatable = true)
    private int userId;

    private String userName;
    private String userAvatar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ownerId", referencedColumnName = "id",
            insertable = false, updatable = false)
    private UserTbl owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", referencedColumnName = "id",
            insertable = false, updatable = false)
    private UserTbl user;

    private String type; // lost | found
    private String status;

    private String title;
    private String titleNe;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String descriptionNe;

    private String location;
    private String locationNe;
    private String category;
    private String subcategory;
    private String date;
    private String createdAt;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String image;

    private String handoverStep;
    private String deliveredDate;
    private String visibleUntil;
    private Integer retentionDaysLeft;
    private String deliveredMessage;
    private String deliveredMessageNe;
    private Integer rewardPoints;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = false)
    @JsonIgnore
    private List<ClaimTbl> claims;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = false)
    @JsonIgnore
    private List<TipTbl> tips;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getOwnerId() { return ownerId; }
    public void setOwnerId(int ownerId) { this.ownerId = ownerId; }
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getUserAvatar() { return userAvatar; }
    public void setUserAvatar(String userAvatar) { this.userAvatar = userAvatar; }
    public UserTbl getOwner() { return owner; }
    public void setOwner(UserTbl owner) { this.owner = owner; }
    public UserTbl getUser() { return user; }
    public void setUser(UserTbl user) { this.user = user; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getTitleNe() { return titleNe; }
    public void setTitleNe(String titleNe) { this.titleNe = titleNe; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDescriptionNe() { return descriptionNe; }
    public void setDescriptionNe(String descriptionNe) { this.descriptionNe = descriptionNe; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getLocationNe() { return locationNe; }
    public void setLocationNe(String locationNe) { this.locationNe = locationNe; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getSubcategory() { return subcategory; }
    public void setSubcategory(String subcategory) { this.subcategory = subcategory; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getHandoverStep() { return handoverStep; }
    public void setHandoverStep(String handoverStep) { this.handoverStep = handoverStep; }
    public String getDeliveredDate() { return deliveredDate; }
    public void setDeliveredDate(String deliveredDate) { this.deliveredDate = deliveredDate; }
    public String getVisibleUntil() { return visibleUntil; }
    public void setVisibleUntil(String visibleUntil) { this.visibleUntil = visibleUntil; }
    public Integer getRetentionDaysLeft() { return retentionDaysLeft; }
    public void setRetentionDaysLeft(Integer retentionDaysLeft) { this.retentionDaysLeft = retentionDaysLeft; }
    public String getDeliveredMessage() { return deliveredMessage; }
    public void setDeliveredMessage(String deliveredMessage) { this.deliveredMessage = deliveredMessage; }
    public String getDeliveredMessageNe() { return deliveredMessageNe; }
    public void setDeliveredMessageNe(String deliveredMessageNe) { this.deliveredMessageNe = deliveredMessageNe; }
    public Integer getRewardPoints() { return rewardPoints; }
    public void setRewardPoints(Integer rewardPoints) { this.rewardPoints = rewardPoints; }
    public List<ClaimTbl> getClaims() { return claims; }
    public void setClaims(List<ClaimTbl> claims) { this.claims = claims; }
    public List<TipTbl> getTips() { return tips; }
    public void setTips(List<TipTbl> tips) { this.tips = tips; }
}
