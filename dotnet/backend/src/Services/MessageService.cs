using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;

namespace Backend.Services;

public interface IMessageService
{
    Task<MessagesResponse> GetMessagesForChannelAsync(string channelId, string userId, int page = 1, int limit = 50);
    Task<MessageResponse> SendMessageAsync(SendMessageRequest request, string userId);
    Task<MessageResponse> EditMessageAsync(string messageId, EditMessageRequest request, string userId);
    Task DeleteMessageAsync(string messageId, string userId);
    Task<List<Reaction>> AddReactionAsync(string messageId, AddReactionRequest request, string userId);
}

public class MessageService : IMessageService
{
    private readonly AppDbContext _context;

    public MessageService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<MessagesResponse> GetMessagesForChannelAsync(string channelId, string userId, int page = 1, int limit = 50)
    {
        // Handle the case where channelId is not a valid ObjectId (like 'general')
        if (!ObjectId.TryParse(channelId, out _))
        {
            // Return empty messages for non-ObjectId channel IDs (like the default 'general')
            return new MessagesResponse
            {
                Messages = new List<MessageResponse>(),
                Pagination = new PaginationInfo
                {
                    Page = page,
                    Limit = limit,
                    Total = 0,
                    HasMore = false
                }
            };
        }

        // Check if user has access to the channel
        var channel = await _context.Channels
            .FirstOrDefaultAsync(c => c.Id == channelId && (!c.IsPrivate || c.Members.Contains(userId)));

        if (channel == null)
        {
            // Return empty messages for non-existent channels to match Node.js behavior
            return new MessagesResponse
            {
                Messages = new List<MessageResponse>(),
                Pagination = new PaginationInfo
                {
                    Page = page,
                    Limit = limit,
                    Total = 0,
                    HasMore = false
                }
            };
        }

        var skip = (page - 1) * limit;

        var messages = await _context.Messages
            .Where(m => m.Channel == channelId)
            .OrderByDescending(m => m.CreatedAt)
            .Skip(skip)
            .Take(limit)
            .ToListAsync();

        // Reverse to show oldest first
        messages.Reverse();

        var total = await _context.Messages.CountAsync(m => m.Channel == channelId);
        var hasMore = skip + messages.Count < total;

        var messageResponses = new List<MessageResponse>();
        foreach (var message in messages)
        {
            var response = await MapToMessageResponseAsync(message);
            messageResponses.Add(response);
        }

        return new MessagesResponse
        {
            Messages = messageResponses,
            Pagination = new PaginationInfo
            {
                Page = page,
                Limit = limit,
                Total = total,
                HasMore = hasMore
            }
        };
    }

    public async Task<MessageResponse> SendMessageAsync(SendMessageRequest request, string userId)
    {
        // Handle the case where channelId is not a valid ObjectId (like 'general')
        if (!ObjectId.TryParse(request.ChannelId, out _))
        {
            throw new InvalidOperationException("Invalid channel ID. Please select a valid channel.");
        }

        // Check if user has access to the channel
        var channel = await _context.Channels
            .FirstOrDefaultAsync(c => c.Id == request.ChannelId && (!c.IsPrivate || c.Members.Contains(userId)));

        if (channel == null)
        {
            throw new InvalidOperationException("Channel not found or no access");
        }

        // Validate message content
        if (string.IsNullOrWhiteSpace(request.Content) && 
            string.IsNullOrWhiteSpace(request.ImageUrl) && 
            string.IsNullOrWhiteSpace(request.FileUrl))
        {
            throw new ArgumentException("Message must have content, image, or file");
        }

        var message = new Message
        {
            Content = request.Content?.Trim(),
            ImageUrl = request.ImageUrl,
            FileUrl = request.FileUrl,
            FileName = request.FileName,
            Sender = userId,
            Channel = request.ChannelId,
            ReplyTo = request.ReplyTo,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        return await MapToMessageResponseAsync(message);
    }

    public async Task<MessageResponse> EditMessageAsync(string messageId, EditMessageRequest request, string userId)
    {
        var message = await _context.Messages.FirstOrDefaultAsync(m => m.Id == messageId);
        
        if (message == null)
        {
            throw new InvalidOperationException("Message not found");
        }

        // Check if user owns the message
        if (message.Sender != userId)
        {
            throw new InvalidOperationException("Not authorized to edit this message");
        }

        // Check if message is older than 15 minutes
        var fifteenMinutesAgo = DateTime.UtcNow.AddMinutes(-15);
        if (message.CreatedAt < fifteenMinutesAgo)
        {
            throw new InvalidOperationException("Cannot edit messages older than 15 minutes");
        }

        if (string.IsNullOrWhiteSpace(request.Content))
        {
            throw new ArgumentException("Message content cannot be empty");
        }

        message.Content = request.Content.Trim();
        message.IsEdited = true;
        message.EditedAt = DateTime.UtcNow;
        message.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();

        return await MapToMessageResponseAsync(message);
    }

    public async Task DeleteMessageAsync(string messageId, string userId)
    {
        var message = await _context.Messages.FirstOrDefaultAsync(m => m.Id == messageId);
        
        if (message == null)
        {
            throw new InvalidOperationException("Message not found");
        }

        // Check if user owns the message or is channel admin
        var channel = await _context.Channels.FirstOrDefaultAsync(c => c.Id == message.Channel);
        var isOwner = message.Sender == userId;
        var isAdmin = channel?.Admins.Contains(userId) == true;

        if (!isOwner && !isAdmin)
        {
            throw new InvalidOperationException("Not authorized to delete this message");
        }

        _context.Messages.Remove(message);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Reaction>> AddReactionAsync(string messageId, AddReactionRequest request, string userId)
    {
        var message = await _context.Messages.FirstOrDefaultAsync(m => m.Id == messageId);
        
        if (message == null)
        {
            throw new InvalidOperationException("Message not found");
        }

        // Check if user has access to the channel
        var channel = await _context.Channels
            .FirstOrDefaultAsync(c => c.Id == message.Channel && (!c.IsPrivate || c.Members.Contains(userId)));

        if (channel == null)
        {
            throw new InvalidOperationException("Channel not found or no access");
        }

        // Find or create reaction
        var reaction = message.Reactions.FirstOrDefault(r => r.Emoji == request.Emoji);
        
        if (reaction != null)
        {
            // Toggle reaction
            if (reaction.Users.Contains(userId))
            {
                reaction.Users.Remove(userId);
                // Remove reaction if no users left
                if (reaction.Users.Count == 0)
                {
                    message.Reactions.Remove(reaction);
                }
            }
            else
            {
                reaction.Users.Add(userId);
            }
        }
        else
        {
            // Add new reaction
            message.Reactions.Add(new Reaction
            {
                Emoji = request.Emoji,
                Users = new List<string> { userId }
            });
        }

        message.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return message.Reactions;
    }

    private async Task<MessageResponse> MapToMessageResponseAsync(Message message)
    {
        // Get sender info
        var sender = await _context.Users.FirstOrDefaultAsync(u => u.Id == message.Sender);
        
        // Get reply-to message info if exists
        MessageResponse? replyToResponse = null;
        if (!string.IsNullOrEmpty(message.ReplyTo))
        {
            var replyToMessage = await _context.Messages.FirstOrDefaultAsync(m => m.Id == message.ReplyTo);
            if (replyToMessage != null)
            {
                var replyToSender = await _context.Users.FirstOrDefaultAsync(u => u.Id == replyToMessage.Sender);
                replyToResponse = new MessageResponse
                {
                    Id = replyToMessage.Id,
                    Content = replyToMessage.Content,
                    Sender = replyToSender != null ? MapToUserResponse(replyToSender) : new UserResponse(),
                    CreatedAt = replyToMessage.CreatedAt
                };
            }
        }

        return new MessageResponse
        {
            Id = message.Id,
            Content = message.Content,
            ImageUrl = message.ImageUrl,
            FileUrl = message.FileUrl,
            FileName = message.FileName,
            Sender = sender != null ? MapToUserResponse(sender) : new UserResponse(),
            Channel = message.Channel,
            IsEdited = message.IsEdited,
            EditedAt = message.EditedAt,
            ReplyTo = replyToResponse,
            Reactions = message.Reactions,
            CreatedAt = message.CreatedAt,
            UpdatedAt = message.UpdatedAt
        };
    }

    private static UserResponse MapToUserResponse(User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Avatar = user.Avatar,
            IsOnline = user.IsOnline,
            LastSeen = user.LastSeen,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}