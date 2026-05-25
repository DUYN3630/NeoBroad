using System;

namespace NeoBoard.Domain.Entities
{
    public class AnnouncementRead
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid AnnouncementId { get; set; }
        public Guid UserId { get; set; }
        public DateTime ReadAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Announcement Announcement { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}
