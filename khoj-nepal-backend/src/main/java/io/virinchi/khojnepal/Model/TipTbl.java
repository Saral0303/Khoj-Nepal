package io.virinchi.khojnepal.Model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "tip_tbl")
public class TipTbl {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(insertable = true, updatable = true)
    private int postId;

    @Column(insertable = true, updatable = true)
    private int userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "postId", referencedColumnName = "id",
            insertable = false, updatable = false)
    private PostTbl post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", referencedColumnName = "id",
            insertable = false, updatable = false)
    private UserTbl user;

    private String infoType;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String message;

    private String status;
    private String createdAt;
}
