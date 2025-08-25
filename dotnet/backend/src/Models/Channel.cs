using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

[Collection("channels")]
public class Channel
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [Required]
    [StringLength(50)]
    public string Name { get; set; } = string.Empty;

    [StringLength(200)]
    public string? Description { get; set; }

    public bool IsPrivate { get; set; } = false;

    public bool IsDirectMessage { get; set; } = false;

    public List<string> Members { get; set; } = new();

    public List<string> Admins { get; set; } = new();

    [Required]
    public string CreatedBy { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties (populated by separate queries)
    [BsonIgnore]
    public User? CreatedByUser { get; set; }

    [BsonIgnore]
    public List<User> MemberUsers { get; set; } = new();
}