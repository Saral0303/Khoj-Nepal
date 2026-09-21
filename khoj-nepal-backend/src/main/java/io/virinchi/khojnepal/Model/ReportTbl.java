package io.virinchi.khojnepal.Model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
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

    private String targetType; // post | claim | help | other (polymorphic — kept as raw int)
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
}
