package io.virinchi.khojnepal.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
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
}
