package io.virinchi.khojnepal.Model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "claim_tbl", indexes = {
        @Index(name = "idx_claim_status", columnList = "status"),
        @Index(name = "idx_claim_postId", columnList = "postId")
})
public class ClaimTbl {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(insertable = true, updatable = true)
    private int ownerId; // claimant user id

    @Column(insertable = true, updatable = true)
    private int postId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ownerId", referencedColumnName = "id",
            insertable = false, updatable = false)
    private UserTbl claimant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "postId", referencedColumnName = "id",
            insertable = false, updatable = false)
    private PostTbl post;

    private String itemTitle;

    private String status;
    private String investigation;

    private int dayOfSeven;
    private String submittedDate;
    private String resolvedDate;

    private String claimantName;
    private String claimantPhone;
    private String claimantEmail;
    private String claimantAddress;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String ownership;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String kycFront;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String kycBack;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String proofImage;

    private boolean kycVerified;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String notes;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String adminMessage;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String historyJson;
}
