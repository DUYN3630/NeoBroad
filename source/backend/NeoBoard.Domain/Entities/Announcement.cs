using System;
using System.Collections.Generic;

namespace NeoBoard.Domain.Entities
{
    public class Announcement
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid? AuthorId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int Priority { get; set; } = 0; // 0:Normal, 1:Important, 2:Urgent
        public bool IsPublished { get; set; } = false;
        public DateTime? PublishedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual User? Author { get; set; }
        public virtual ICollection<AnnouncementRead> Reads { get; set; } = new List<AnnouncementRead>();
    }
}
