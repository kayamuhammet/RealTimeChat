using ChatApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options){}

    public DbSet<ChatMessage> Messages => Set<ChatMessage>();
}
