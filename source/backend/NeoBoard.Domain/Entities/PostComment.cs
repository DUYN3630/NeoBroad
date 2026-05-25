using System;

namespace NeoBoard.Domain.Entities
{
    public class PostComment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PostId { get; set; }
        public Guid AuthorId { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual TimelinePost Post { get; set; } = null!;
        public virtual User Author { get; set; } = null!;
    }
}
