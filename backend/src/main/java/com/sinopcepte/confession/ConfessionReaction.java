package com.sinopcepte.confession;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "confession_reaction",
        uniqueConstraints = @UniqueConstraint(columnNames = {"confession_id", "user_handle", "reaction_type"})
)
public class ConfessionReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "confession_id", nullable = false)
    private String confessionId;

    @Column(name = "user_handle", nullable = false)
    private String userHandle;

    @Column(name = "reaction_type", nullable = false)
    private String reactionType;

    protected ConfessionReaction() {
    }

    public ConfessionReaction(String confessionId, String userHandle, String reactionType) {
        this.confessionId = confessionId;
        this.userHandle = userHandle;
        this.reactionType = reactionType;
    }

    public Long getId() { return id; }
    public String getConfessionId() { return confessionId; }
    public String getUserHandle() { return userHandle; }
    public String getReactionType() { return reactionType; }
}
