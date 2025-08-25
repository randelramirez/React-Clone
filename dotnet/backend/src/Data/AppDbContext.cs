using MongoDB.EntityFrameworkCore.Extensions;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public DbSet<User> Users { get; init; }
    public DbSet<Channel> Channels { get; init; }
    public DbSet<Message> Messages { get; init; }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<User>().ToCollection("users");
        modelBuilder.Entity<Channel>().ToCollection("channels");
        modelBuilder.Entity<Message>().ToCollection("messages");

        // Index for better performance
        modelBuilder.Entity<Channel>()
            .HasIndex(c => c.Members);
            
        modelBuilder.Entity<Channel>()
            .HasIndex(c => c.CreatedBy);
            
        modelBuilder.Entity<Channel>()
            .HasIndex(c => new { c.IsDirectMessage, c.Members });

        modelBuilder.Entity<Message>()
            .HasIndex(m => new { m.Channel, m.CreatedAt });
            
        modelBuilder.Entity<Message>()
            .HasIndex(m => m.Sender);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
            
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();
    }
}