package io.virinchi.khojnepal.Model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
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
}
