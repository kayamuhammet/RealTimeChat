using ChatApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options){}

    public DbSet<ChatMessage> Messages { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.UserName)
            .IsUnique();
    }
}
