using System;

namespace JobTrackAI.ApplicationService.Models
{
    public class JobApplication
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Salary { get; set; } = string.Empty;
        public string Status { get; set; } = "Wishlist"; // Wishlist, Applied, Interviewing, Offer, Rejected
        public string JobDescriptionUrl { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime DateApplied { get; set; } = DateTime.UtcNow;
    }
}
