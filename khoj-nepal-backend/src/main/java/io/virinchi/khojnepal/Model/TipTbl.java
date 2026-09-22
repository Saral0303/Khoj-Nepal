package io.virinchi.khojnepal.Model;

import jakarta.persistence.*;

@Entity
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

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getPostId() { return postId; }
    public void setPostId(int postId) { this.postId = postId; }
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }
    public PostTbl getPost() { return post; }
    public void setPost(PostTbl post) { this.post = post; }
    public UserTbl getUser() { return user; }
    public void setUser(UserTbl user) { this.user = user; }
    public String getInfoType() { return infoType; }
    public void setInfoType(String infoType) { this.infoType = infoType; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
