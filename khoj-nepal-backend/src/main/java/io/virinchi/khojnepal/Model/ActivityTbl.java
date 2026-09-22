package io.virinchi.khojnepal.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "activity_tbl")
public class ActivityTbl {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(insertable = true, updatable = true)
    private int ownerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ownerId", referencedColumnName = "id",
            insertable = false, updatable = false)
    private UserTbl owner;

    private String timeLabel;
    private String timeNe;
    private String icon;
    private String activityKey;
    private String createdAt;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getOwnerId() { return ownerId; }
    public void setOwnerId(int ownerId) { this.ownerId = ownerId; }
    public UserTbl getOwner() { return owner; }
    public void setOwner(UserTbl owner) { this.owner = owner; }
    public String getTimeLabel() { return timeLabel; }
    public void setTimeLabel(String timeLabel) { this.timeLabel = timeLabel; }
    public String getTimeNe() { return timeNe; }
    public void setTimeNe(String timeNe) { this.timeNe = timeNe; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public String getActivityKey() { return activityKey; }
    public void setActivityKey(String activityKey) { this.activityKey = activityKey; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
