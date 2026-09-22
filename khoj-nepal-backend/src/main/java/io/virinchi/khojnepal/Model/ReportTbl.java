package io.virinchi.khojnepal.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "report_tbl")
public class ReportTbl {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(insertable = true, updatable = true)
    private Integer reporterId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporterId", referencedColumnName = "id",
            insertable = false, updatable = false)
    private UserTbl reporter;

    private String targetType; // post | claim | help | other
    private Integer targetId;
    private String reason;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String image;

    private String status;
    private String createdAt;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public Integer getReporterId() { return reporterId; }
    public void setReporterId(Integer reporterId) { this.reporterId = reporterId; }
    public UserTbl getReporter() { return reporter; }
    public void setReporter(UserTbl reporter) { this.reporter = reporter; }
    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }
    public Integer getTargetId() { return targetId; }
    public void setTargetId(Integer targetId) { this.targetId = targetId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
