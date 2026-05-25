using System;
using System.Collections.Generic;

namespace NeoBoard.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public int Role { get; set; } = 3; // 0:SuperAdmin, 1:Admin, 2:Manager, 3:Employee
        public string? Department { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime? LastLoginAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
        public virtual ICollection<TimelinePost> Posts { get; set; } = new List<TimelinePost>();
        public virtual ICollection<PostComment> Comments { get; set; } = new List<PostComment>();
        public virtual ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();
        public virtual ICollection<AnnouncementRead> Reads { get; set; } = new List<AnnouncementRead>();
        public virtual ICollection<Survey> CreatedSurveys { get; set; } = new List<Survey>();
        public virtual ICollection<SurveyResponse> SurveyResponses { get; set; } = new List<SurveyResponse>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public virtual ICollection<FileAttachment> UploadedFiles { get; set; } = new List<FileAttachment>();
        public virtual ICollection<UserActivity> Activities { get; set; } = new List<UserActivity>();
    }
}
