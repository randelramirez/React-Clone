using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Backend.Services;

namespace Backend.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IUserService _userService;

    public ChatHub(IUserService userService)
    {
        _userService = userService;
    }

    public async Task JoinChannel(string channelId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"channel:{channelId}");
    }

    public async Task LeaveChannel(string channelId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"channel:{channelId}");
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            // Update user status to online
            // This would be handled by a background service in a production app
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            // Update user status to offline
            await _userService.LogoutUserAsync(userId);
        }
        await base.OnDisconnectedAsync(exception);
    }
}