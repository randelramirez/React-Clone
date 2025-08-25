using System.ComponentModel.DataAnnotations;
using Backend.Models;

namespace Backend.DTOs;

public class SendMessageRequest
{
    public string? Content { get; set; }
    public string? ImageUrl { get; set; }
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }
    
    [Required]
    public string ChannelId { get; set; } = string.Empty;
    
    public string? ReplyTo { get; set; }
}

public class EditMessageRequest
{
    [Required]
    public string Content { get; set; } = string.Empty;
}

public class AddReactionRequest
{
    [Required]
    public string Emoji { get; set; } = string.Empty;
}

public class MessageResponse
{
    public string Id { get; set; } = string.Empty;
    public string? Content { get; set; }
    public string? ImageUrl { get; set; }
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }
    public UserResponse Sender { get; set; } = new();
    public string Channel { get; set; } = string.Empty;
    public bool IsEdited { get; set; }
    public DateTime? EditedAt { get; set; }
    public MessageResponse? ReplyTo { get; set; }
    public List<Reaction> Reactions { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class MessagesResponse
{
    public List<MessageResponse> Messages { get; set; } = new();
    public PaginationInfo Pagination { get; set; } = new();
}

public class PaginationInfo
{
    public int Page { get; set; }
    public int Limit { get; set; }
    public long Total { get; set; }
    public bool HasMore { get; set; }
}