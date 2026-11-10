package com.sinopcepte.confession;

import java.time.OffsetDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "confession_comment")
public class ConfessionComment {

    @Id
    private String id;

    @Column(name = "confession_id", nullable = false)
    private String confessionId;

    @Column(name = "author_handle", nullable = false)
    private String authorHandle;

    @Column(name = "alias_name", nullable = false)
    private String aliasName;

    @Column(name = "alias_avatar", nullable = false)
    private String aliasAvatar = "marti";

    @Column(name = "is_anonymous", nullable = false)
    private boolean isAnonymous = true;

    @Column(nullable = false, length = 300)
    private String body;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected ConfessionComment() {
    }

    public ConfessionComment(String id, String confessionId, String authorHandle, String aliasName,
                             String aliasAvatar, boolean isAnonymous, String body, OffsetDateTime createdAt) {
        this.id = id;
        this.confessionId = confessionId;
        this.authorHandle = authorHandle;
        this.aliasName = aliasName;
        this.aliasAvatar = aliasAvatar != null ? aliasAvatar : "marti";
        this.isAnonymous = isAnonymous;
        this.body = body;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public String getConfessionId() { return confessionId; }
    public String getAuthorHandle() { return authorHandle; }
    public String getAliasName() { return aliasName; }
    public String getAliasAvatar() { return aliasAvatar; }
    public boolean isAnonymous() { return isAnonymous; }
    public String getBody() { return body; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
