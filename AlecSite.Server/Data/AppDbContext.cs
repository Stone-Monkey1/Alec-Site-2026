using AlecSite.Server.Projects;
using Microsoft.EntityFrameworkCore;

namespace AlecSite.Server.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Project> Projects => Set<Project>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Project>(project =>
        {
            project.HasIndex(p => p.Slug).IsUnique();
            project.Property(p => p.Status).HasConversion<string>();
            project.OwnsMany(p => p.Links, links => links.ToJson());
        });
    }
}
