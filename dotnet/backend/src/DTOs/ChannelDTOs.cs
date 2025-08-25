using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

public class CreateChannelRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsPrivate { get; set; } = false;
}

public class CreateDirectMessageRequest
{
    [Required]
    public string UserId { get; set; } = string.Empty;
}

public class ChannelResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsPrivate { get; set; }
    public bool IsDirectMessage { get; set; }
    public List<UserResponse> Members { get; set; } = new();
    public List<UserResponse> Admins { get; set; } = new();
    public UserResponse? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}