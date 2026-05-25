using System;
using System.Collections.Generic;

namespace NeoBoard.Domain.Entities
{
    public class Asset
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string? SerialNumber { get; set; }
        public string? Type { get; set; }
        public string Status { get; set; } = "Available"; // Available, InUse, Maintenance, Broken
        public string? Department { get; set; }
        public decimal? Price { get; set; }
        public DateTime? LastMaintenance { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual ICollection<BorrowItem> BorrowItems { get; set; } = new List<BorrowItem>();
    }
}
