using System;
using System.Collections.Generic;

namespace NeoBoard.Domain.Entities
{
    public class TimelinePost
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid AuthorId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int LikeCount { get; set; } = 0;
        public int CommentCount { get; set; } = 0;
        public bool IsPublished { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual User Author { get; set; } = null!;
        public virtual ICollection<PostComment> Comments { get; set; } = new List<PostComment>();
    }
}
