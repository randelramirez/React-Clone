using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IChannelService
{
    Task<List<ChannelResponse>> GetChannelsForUserAsync(string userId);
    Task<ChannelResponse?> GetChannelByIdAsync(string channelId, string userId);
    Task<ChannelResponse> CreateChannelAsync(CreateChannelRequest request, string userId);
    Task<ChannelResponse> CreateDirectMessageAsync(CreateDirectMessageRequest request, string currentUserId);
    Task JoinChannelAsync(string channelId, string userId);
    Task LeaveChannelAsync(string channelId, string userId);
}

public class ChannelService : IChannelService
{
    private readonly AppDbContext _context;

    public ChannelService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ChannelResponse>> GetChannelsForUserAsync(string userId)
    {
        var channels = await _context.Channels
            .Where(c => !c.IsPrivate || c.Members.Contains(userId))
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        var channelResponses = new List<ChannelResponse>();
        
        foreach (var channel in channels)
        {
            var response = await MapToChannelResponseAsync(channel);
            channelResponses.Add(response);
        }

        return channelResponses;
    }

    public async Task<ChannelResponse?> GetChannelByIdAsync(string channelId, string userId)
    {
        var channel = await _context.Channels
            .FirstOrDefaultAsync(c => c.Id == channelId && (!c.IsPrivate || c.Members.Contains(userId)));

        return channel != null ? await MapToChannelResponseAsync(channel) : null;
    }

    public async Task<ChannelResponse> CreateChannelAsync(CreateChannelRequest request, string userId)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Channel name is required");
        }

        // Check if public channel name already exists
        if (!request.IsPrivate)
        {
            var existingChannel = await _context.Channels
                .FirstOrDefaultAsync(c => c.Name == request.Name.Trim() && !c.IsPrivate);
            if (existingChannel != null)
            {
                throw new InvalidOperationException("Channel name already exists");
            }
        }

        var channel = new Channel
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            IsPrivate = request.IsPrivate,
            IsDirectMessage = false,
            Members = new List<string> { userId },
            Admins = new List<string> { userId },
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Channels.Add(channel);
        await _context.SaveChangesAsync();

        return await MapToChannelResponseAsync(channel);
    }

    public async Task<ChannelResponse> CreateDirectMessageAsync(CreateDirectMessageRequest request, string currentUserId)
    {
        if (request.UserId == currentUserId)
        {
            throw new InvalidOperationException("Cannot create DM with yourself");
        }

        // Check if target user exists
        var targetUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId);
        if (targetUser == null)
        {
            throw new InvalidOperationException("User not found");
        }

        // Check if DM channel already exists
        var existingChannel = await _context.Channels
            .FirstOrDefaultAsync(c => c.IsDirectMessage && 
                                    c.Members.Contains(currentUserId) && 
                                    c.Members.Contains(request.UserId));

        if (existingChannel != null)
        {
            return await MapToChannelResponseAsync(existingChannel);
        }

        var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == currentUserId);
        if (currentUser == null)
        {
            throw new InvalidOperationException("Current user not found");
        }

        // Create new DM channel
        var channel = new Channel
        {
            Name = $"{currentUser.Username}, {targetUser.Username}",
            IsPrivate = true,
            IsDirectMessage = true,
            Members = new List<string> { currentUserId, request.UserId },
            Admins = new List<string> { currentUserId, request.UserId },
            CreatedBy = currentUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Channels.Add(channel);
        await _context.SaveChangesAsync();

        return await MapToChannelResponseAsync(channel);
    }

    public async Task JoinChannelAsync(string channelId, string userId)
    {
        var channel = await _context.Channels.FirstOrDefaultAsync(c => c.Id == channelId);
        if (channel == null)
        {
            throw new InvalidOperationException("Channel not found");
        }

        if (channel.IsPrivate)
        {
            throw new InvalidOperationException("Cannot join private channel without invitation");
        }

        if (channel.Members.Contains(userId))
        {
            throw new InvalidOperationException("Already a member of this channel");
        }

        channel.Members.Add(userId);
        channel.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task LeaveChannelAsync(string channelId, string userId)
    {
        var channel = await _context.Channels.FirstOrDefaultAsync(c => c.Id == channelId);
        if (channel == null)
        {
            throw new InvalidOperationException("Channel not found");
        }

        if (!channel.Members.Contains(userId))
        {
            throw new InvalidOperationException("Not a member of this channel");
        }

        channel.Members.Remove(userId);
        channel.Admins.Remove(userId);
        channel.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    private async Task<ChannelResponse> MapToChannelResponseAsync(Channel channel)
    {
        // Get creator info
        var creator = await _context.Users.FirstOrDefaultAsync(u => u.Id == channel.CreatedBy);
        
        // Get member users
        var memberUsers = await _context.Users
            .Where(u => channel.Members.Contains(u.Id))
            .ToListAsync();

        return new ChannelResponse
        {
            Id = channel.Id,
            Name = channel.Name,
            Description = channel.Description,
            IsPrivate = channel.IsPrivate,
            IsDirectMessage = channel.IsDirectMessage,
            Members = memberUsers.Select(MapToUserResponse).ToList(),
            CreatedBy = creator != null ? MapToUserResponse(creator) : null,
            CreatedAt = channel.CreatedAt,
            UpdatedAt = channel.UpdatedAt
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