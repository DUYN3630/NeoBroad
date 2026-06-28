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

        public string Status { get; set; } = "Available"; // Available, InUse, Broken
        public string? Location { get; set; }
        public string? Custodian { get; set; }
        public string? Supplier { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public int WarrantyMonths { get; set; } = 12;
        public string? ItemsDetail { get; set; }
        public DateTime? LastMaintenanceDate { get; set; }
        public string? Department { get; set; }

        // Navigation
        public virtual ICollection<BorrowItem> BorrowItems { get; set; } = new List<BorrowItem>();
    }
}
