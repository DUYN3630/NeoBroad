using System;
using System.Collections.Generic;

namespace NeoBoard.Domain.Entities
{
    public class Toolset
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? Description { get; set; }
        public int TotalQuantity { get; set; }
        public int AvailableQuantity { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual ICollection<BorrowItem> BorrowItems { get; set; } = new List<BorrowItem>();
    }
}
