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

        public string AssetCode { get; set; } = string.Empty;
        public string? Model { get; set; }
        public string? Location { get; set; }
        public string? Custodian { get; set; }
        public string? Manufacturer { get; set; }
        public string? Supplier { get; set; }
        public string? InvoiceNumber { get; set; }
        public string? TechnicalSpecs { get; set; }
        public string? Notes { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public int WarrantyMonths { get; set; } = 12;
        public DateTime? WarrantyExpiration { get; set; }
        public int MaintenanceIntervalMonths { get; set; } = 6;
        public Guid? AssignedTechnicianId { get; set; }

        // Navigation
        public virtual AssetHealth? Health { get; set; }
        public virtual User? AssignedTechnician { get; set; }
        public virtual ICollection<BorrowItem> BorrowItems { get; set; } = new List<BorrowItem>();
    }
}
