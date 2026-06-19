using Microsoft.EntityFrameworkCore;
using JobTrackAI.ApplicationService.Models;

namespace JobTrackAI.ApplicationService.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<JobApplication> JobApplications => Set<JobApplication>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<JobApplication>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.Company).IsRequired();
                entity.Property(e => e.Role).IsRequired();
                entity.Property(e => e.Status).IsRequired();
                entity.Property(e => e.Salary).IsRequired(false);
                entity.Property(e => e.JobDescriptionUrl).IsRequired(false);
                entity.Property(e => e.Notes).IsRequired(false);
                entity.Property(e => e.DateApplied).IsRequired();
            });
        }
    }
}
