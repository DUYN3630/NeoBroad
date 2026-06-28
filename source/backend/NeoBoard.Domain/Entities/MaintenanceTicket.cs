using System;

namespace NeoBoard.Domain.Entities
{
    public class MaintenanceTicket
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid AssetId { get; set; }
        public Guid? AssignedTechnicianId { get; set; }
        
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "Assigned"; // Assigned, InProgress, Completed, Cancelled
        public DateTime ScheduledDate { get; set; } = DateTime.UtcNow;
        public DateTime? MaintenanceDate { get; set; }
        public decimal TotalCost { get; set; } = 0;
        public string? VerificationResult { get; set; } // Passed, Failed
        public string? ActionTaken { get; set; }
        public string? SparePartsUsed { get; set; }
        public string? Notes { get; set; }
        public string? EvidencePhotoUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Asset Asset { get; set; } = null!;
        public virtual User? AssignedTechnician { get; set; }
    }
}
