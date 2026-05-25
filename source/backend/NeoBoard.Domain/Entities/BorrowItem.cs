using System;

namespace NeoBoard.Domain.Entities
{
    public class BorrowItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid BorrowRequestId { get; set; }
        
        public Guid? AssetId { get; set; } // Nếu mượn thiết bị lẻ
        public Guid? ToolsetId { get; set; } // Nếu mượn từ bộ dụng cụ
        public int Quantity { get; set; } = 1; // Số lượng (thường là 1 cho Asset)

        public string ConditionOnBorrow { get; set; } = "Good";
        public string? ConditionOnReturn { get; set; }
        public DateTime? ActualReturnDate { get; set; }

        // Navigation
        public virtual BorrowRequest BorrowRequest { get; set; } = null!;
        public virtual Asset? Asset { get; set; }
        public virtual Toolset? Toolset { get; set; }
    }
}
