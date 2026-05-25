using System;

namespace NeoBoard.Domain.Entities
{
    public class SurveyResponse
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid QuestionId { get; set; }
        public Guid UserId { get; set; }
        public string Answer { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual SurveyQuestion Question { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}
