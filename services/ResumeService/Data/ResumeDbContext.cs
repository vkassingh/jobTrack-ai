using Microsoft.EntityFrameworkCore;
using JobTrackAI.ResumeService.Models;

namespace JobTrackAI.ResumeService.Data
{
    public class ResumeDbContext : DbContext
    {
        public ResumeDbContext(DbContextOptions<ResumeDbContext> options) : base(options)
        {
        }

        public DbSet<Resume> Resumes => Set<Resume>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Resume>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.FileName).IsRequired();
                entity.Property(e => e.FilePath).IsRequired();
                entity.Property(e => e.UploadDate).IsRequired();
                entity.Property(e => e.ParsedText).IsRequired();
            });
        }
    }
}
