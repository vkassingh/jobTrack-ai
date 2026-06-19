using System;

namespace JobTrackAI.ResumeService.Models
{
    public class Resume
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public DateTime UploadDate { get; set; }
        public string ParsedText { get; set; } = string.Empty;
    }
}
