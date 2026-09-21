package io.virinchi.khojnepal.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
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
}
