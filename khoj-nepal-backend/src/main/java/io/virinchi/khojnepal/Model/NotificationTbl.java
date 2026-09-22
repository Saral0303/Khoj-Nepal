package io.virinchi.khojnepal.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "notification_tbl", indexes = {
        @Index(name = "idx_notification_ownerId", columnList = "ownerId")
})
public class NotificationTbl {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(insertable = true, updatable = true)
    private int ownerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ownerId", referencedColumnName = "id",
            insertable = false, updatable = false)
    private UserTbl owner;

    private boolean readFlag;
    private String timeLabel;
    private String timeNe;
    private String notifKey;
    private String type;
    private Integer points;
    private String createdAt;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getOwnerId() { return ownerId; }
    public void setOwnerId(int ownerId) { this.ownerId = ownerId; }
    public UserTbl getOwner() { return owner; }
    public void setOwner(UserTbl owner) { this.owner = owner; }
    public boolean isReadFlag() { return readFlag; }
    public void setReadFlag(boolean readFlag) { this.readFlag = readFlag; }
    public String getTimeLabel() { return timeLabel; }
    public void setTimeLabel(String timeLabel) { this.timeLabel = timeLabel; }
    public String getTimeNe() { return timeNe; }
    public void setTimeNe(String timeNe) { this.timeNe = timeNe; }
    public String getNotifKey() { return notifKey; }
    public void setNotifKey(String notifKey) { this.notifKey = notifKey; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
