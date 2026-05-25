using System;
using System.Collections.Generic;

namespace NeoBoard.Domain.Entities
{
    public class Survey
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid? CreatorId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Status { get; set; } = 0; // 0:Draft, 1:Active, 2:Closed
        public DateTime? StartsAt { get; set; }
        public DateTime? EndsAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual User? Creator { get; set; }
        public virtual ICollection<SurveyQuestion> Questions { get; set; } = new List<SurveyQuestion>();
    }
}
