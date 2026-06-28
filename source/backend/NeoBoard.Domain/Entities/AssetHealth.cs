using System;

namespace NeoBoard.Domain.Entities
{
    public class AssetHealth
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid AssetId { get; set; }
        
        // Component Lifespan tracking
        public int? BatteryCycleCount { get; set; }
        public int? BatteryHealthPercentage { get; set; } // 0-100
        public int? BulbHoursUsed { get; set; }
        
        // Maintenance configuration
        public int MaintenanceCycleDays { get; set; } = 180; // Default 6 months
        public DateTime LastMaintenanceDate { get; set; } = DateTime.UtcNow;
        public DateTime? NextScheduledMaintenance { get; set; }
        public DateTime? EstimatedReplacementDate { get; set; }
        
        public string HealthStatus { get; set; } = "Good"; // Good, Warning, Critical
        public string? HealthNotes { get; set; }

        // Navigation
        public virtual Asset Asset { get; set; } = null!;
    }
}
