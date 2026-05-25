using System;

namespace NeoBoard.Domain.Entities
{
    public class FileAttachment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid? UploadedById { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string? OriginalName { get; set; }
        public string? ContentType { get; set; }
        public long? FileSizeBytes { get; set; }
        public string StoragePath { get; set; } = string.Empty;
        public string? EntityType { get; set; } // 'post', 'announcement', 'avatar', 'survey'
        public Guid? EntityId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual User? UploadedBy { get; set; }
    }
}
