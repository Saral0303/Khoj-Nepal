package io.virinchi.khojnepal.Model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
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
}
