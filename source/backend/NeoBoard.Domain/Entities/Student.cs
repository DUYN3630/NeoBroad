using System;
using System.Collections.Generic;

namespace NeoBoard.Domain.Entities
{
    public class Student
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string StudentCode { get; set; } = string.Empty; // MSSV
        public string FullName { get; set; } = string.Empty;
        public string? ClassName { get; set; }
        public string? Email { get; set; }
        public string? Department { get; set; }
        public bool IsBlocked { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual ICollection<BorrowRequest> BorrowRequests { get; set; } = new List<BorrowRequest>();
    }
}
