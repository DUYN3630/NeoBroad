using System;
using System.Collections.Generic;

namespace NeoBoard.Domain.Entities
{
    public class BorrowRequest
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; } // Người mượn
        public DateTime RequestDate { get; set; } = DateTime.UtcNow;
        public DateTime ExpectedReturnDate { get; set; }
        public string? Purpose { get; set; } // Mục đích mượn
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Returned, Overdue
        public Guid? ApprovedById { get; set; } // Người duyệt
        public string? Note { get; set; }

        // Navigation
        public virtual User User { get; set; } = null!;
        public virtual User? ApprovedBy { get; set; }
        public virtual ICollection<BorrowItem> Items { get; set; } = new List<BorrowItem>();
    }
}
