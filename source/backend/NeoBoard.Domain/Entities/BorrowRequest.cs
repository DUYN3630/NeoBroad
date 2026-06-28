using System;
using System.Collections.Generic;

namespace NeoBoard.Domain.Entities
{
    public class BorrowRequest
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; } // Người mượn (Nhân viên/Admin)
        public Guid? StudentId { get; set; } // Sinh viên mượn (nếu có)
        public DateTime RequestDate { get; set; } = DateTime.UtcNow;
        public DateTime ExpectedReturnDate { get; set; }
        public string? Purpose { get; set; } // Mục đích mượn
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Returned, Overdue
        public Guid? ApprovedById { get; set; } // Người duyệt
        public string? Note { get; set; }

        // Security & Blockchain
        public string? EvidencePhotoUrl { get; set; } // Ảnh selfie lúc mượn
        public string? TransactionHash { get; set; } // Mã hash giao dịch
        public string? PreviousHash { get; set; } // Mã hash của giao dịch trước đó (Linked Log)

        // Navigation
        public virtual User User { get; set; } = null!;
        public virtual Student? Student { get; set; }
        public virtual User? ApprovedBy { get; set; }
        public virtual ICollection<BorrowItem> Items { get; set; } = new List<BorrowItem>();
    }
}
