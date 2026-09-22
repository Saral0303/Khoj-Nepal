package io.virinchi.khojnepal.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "user_tbl", indexes = {
        @Index(name = "idx_user_kycStatus", columnList = "kycStatus")
})
public class UserTbl {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String fullName;
    private String username;
    private String dateOfBirth;
    private String gender;
    private String mobile;
    private String email;
    private String province;
    private String district;
    private String city;
    private String password;
    private String role; // user | admin

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String profilePicture;

    private String kycStatus; // none | pending | verified | rejected

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String kycFront;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String kycBack;

    private String kycSubmittedAt;

    private int points;
    private int itemsReported;
    private int itemsReturned;
    private String memberSince;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = false)
    @JsonIgnore
    private List<PostTbl> ownedPosts;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = false)
    @JsonIgnore
    private List<PostTbl> createdPosts;

    @OneToMany(mappedBy = "claimant", cascade = CascadeType.ALL, orphanRemoval = false)
    @JsonIgnore
    private List<ClaimTbl> claims;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = false)
    @JsonIgnore
    private List<NotificationTbl> notifications;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = false)
    @JsonIgnore
    private List<ActivityTbl> activities;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = false)
    @JsonIgnore
    private List<TipTbl> tips;

    @OneToMany(mappedBy = "reporter", cascade = CascadeType.ALL, orphanRemoval = false)
    @JsonIgnore
    private List<ReportTbl> reports;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
    public String getKycStatus() { return kycStatus; }
    public void setKycStatus(String kycStatus) { this.kycStatus = kycStatus; }
    public String getKycFront() { return kycFront; }
    public void setKycFront(String kycFront) { this.kycFront = kycFront; }
    public String getKycBack() { return kycBack; }
    public void setKycBack(String kycBack) { this.kycBack = kycBack; }
    public String getKycSubmittedAt() { return kycSubmittedAt; }
    public void setKycSubmittedAt(String kycSubmittedAt) { this.kycSubmittedAt = kycSubmittedAt; }
    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
    public int getItemsReported() { return itemsReported; }
    public void setItemsReported(int itemsReported) { this.itemsReported = itemsReported; }
    public int getItemsReturned() { return itemsReturned; }
    public void setItemsReturned(int itemsReturned) { this.itemsReturned = itemsReturned; }
    public String getMemberSince() { return memberSince; }
    public void setMemberSince(String memberSince) { this.memberSince = memberSince; }
    public List<PostTbl> getOwnedPosts() { return ownedPosts; }
    public void setOwnedPosts(List<PostTbl> ownedPosts) { this.ownedPosts = ownedPosts; }
    public List<PostTbl> getCreatedPosts() { return createdPosts; }
    public void setCreatedPosts(List<PostTbl> createdPosts) { this.createdPosts = createdPosts; }
    public List<ClaimTbl> getClaims() { return claims; }
    public void setClaims(List<ClaimTbl> claims) { this.claims = claims; }
    public List<NotificationTbl> getNotifications() { return notifications; }
    public void setNotifications(List<NotificationTbl> notifications) { this.notifications = notifications; }
    public List<ActivityTbl> getActivities() { return activities; }
    public void setActivities(List<ActivityTbl> activities) { this.activities = activities; }
    public List<TipTbl> getTips() { return tips; }
    public void setTips(List<TipTbl> tips) { this.tips = tips; }
    public List<ReportTbl> getReports() { return reports; }
    public void setReports(List<ReportTbl> reports) { this.reports = reports; }
}
