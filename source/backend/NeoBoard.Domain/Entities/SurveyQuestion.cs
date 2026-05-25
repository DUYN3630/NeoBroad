using System;
using System.Collections.Generic;

namespace NeoBoard.Domain.Entities
{
    public class SurveyQuestion
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid SurveyId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string QuestionType { get; set; } = string.Empty; // 'text', 'radio', 'checkbox'
        public string? Options { get; set; } // JSONB in DB
        public bool IsRequired { get; set; } = true;
        public int SortOrder { get; set; } = 0;

        // Navigation properties
        public virtual Survey Survey { get; set; } = null!;
        public virtual ICollection<SurveyResponse> Responses { get; set; } = new List<SurveyResponse>();
    }
}
