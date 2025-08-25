using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

[Collection("messages")]
public class Message
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [StringLength(1000)]
    public string? Content { get; set; }

    public string? ImageUrl { get; set; }

    public string? FileUrl { get; set; }

    public string? FileName { get; set; }

    [Required]
    public string Sender { get; set; } = string.Empty;

    [Required]
    public string Channel { get; set; } = string.Empty;

    public bool IsEdited { get; set; } = false;

    public DateTime? EditedAt { get; set; }

    public string? ReplyTo { get; set; }

    public List<Reaction> Reactions { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties (populated by separate queries)
    [BsonIgnore]
    public User? SenderUser { get; set; }

    [BsonIgnore]
    public Message? ReplyToMessage { get; set; }
}

public class Reaction
{
    public string Emoji { get; set; } = string.Empty;
    public List<string> Users { get; set; } = new();
}