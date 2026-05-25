using System;

namespace NeoBoard.Domain.Entities
{
    public class UserActivity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid? UserId { get; set; }
        public string Action { get; set; } = string.Empty; // 'LOGIN', 'CREATE_POST', 'DELETE_USER', etc.
        public string? Description { get; set; }
        public string? IpAddress { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual User? User { get; set; }
    }
}
