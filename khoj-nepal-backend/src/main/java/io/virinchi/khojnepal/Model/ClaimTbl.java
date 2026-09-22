package io.virinchi.khojnepal.Model;

import jakarta.persistence.*;

@Entity
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

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getOwnerId() { return ownerId; }
    public void setOwnerId(int ownerId) { this.ownerId = ownerId; }
    public int getPostId() { return postId; }
    public void setPostId(int postId) { this.postId = postId; }
    public UserTbl getClaimant() { return claimant; }
    public void setClaimant(UserTbl claimant) { this.claimant = claimant; }
    public PostTbl getPost() { return post; }
    public void setPost(PostTbl post) { this.post = post; }
    public String getItemTitle() { return itemTitle; }
    public void setItemTitle(String itemTitle) { this.itemTitle = itemTitle; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getInvestigation() { return investigation; }
    public void setInvestigation(String investigation) { this.investigation = investigation; }
    public int getDayOfSeven() { return dayOfSeven; }
    public void setDayOfSeven(int dayOfSeven) { this.dayOfSeven = dayOfSeven; }
    public String getSubmittedDate() { return submittedDate; }
    public void setSubmittedDate(String submittedDate) { this.submittedDate = submittedDate; }
    public String getResolvedDate() { return resolvedDate; }
    public void setResolvedDate(String resolvedDate) { this.resolvedDate = resolvedDate; }
    public String getClaimantName() { return claimantName; }
    public void setClaimantName(String claimantName) { this.claimantName = claimantName; }
    public String getClaimantPhone() { return claimantPhone; }
    public void setClaimantPhone(String claimantPhone) { this.claimantPhone = claimantPhone; }
    public String getClaimantEmail() { return claimantEmail; }
    public void setClaimantEmail(String claimantEmail) { this.claimantEmail = claimantEmail; }
    public String getClaimantAddress() { return claimantAddress; }
    public void setClaimantAddress(String claimantAddress) { this.claimantAddress = claimantAddress; }
    public String getOwnership() { return ownership; }
    public void setOwnership(String ownership) { this.ownership = ownership; }
    public String getKycFront() { return kycFront; }
    public void setKycFront(String kycFront) { this.kycFront = kycFront; }
    public String getKycBack() { return kycBack; }
    public void setKycBack(String kycBack) { this.kycBack = kycBack; }
    public String getProofImage() { return proofImage; }
    public void setProofImage(String proofImage) { this.proofImage = proofImage; }
    public boolean isKycVerified() { return kycVerified; }
    public void setKycVerified(boolean kycVerified) { this.kycVerified = kycVerified; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getAdminMessage() { return adminMessage; }
    public void setAdminMessage(String adminMessage) { this.adminMessage = adminMessage; }
    public String getHistoryJson() { return historyJson; }
    public void setHistoryJson(String historyJson) { this.historyJson = historyJson; }
}
