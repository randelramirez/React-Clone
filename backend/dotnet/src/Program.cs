using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using System.Text;
using System.Security.Claims;
using Backend.Data;
using Backend.Services;
using Backend.Hubs;
using Backend.DTOs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(builder.Configuration["FrontendUrl"] ?? "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add MongoDB with Entity Framework
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseMongoDB(builder.Configuration.GetConnectionString("MongoDb")!, "slack-clone");
});

// Add Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"]!))
        };

        // Configure JWT for SignalR
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chatHub"))
                {
                    context.Token = accessToken;
                }
                
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// Add SignalR
builder.Services.AddSignalR();

// Register services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IChannelService, ChannelService>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<IUserService, UserService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Helper method to get current user ID
string GetCurrentUserId(ClaimsPrincipal user)
{
    return user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
}

// Health check endpoint
app.MapGet("/api/health", () => Results.Ok(new { message = "Server is running!" }));

// Auth endpoints
app.MapPost("/api/auth/register", async (RegisterRequest request, IAuthService authService) =>
{
    try
    {
        var result = await authService.RegisterAsync(request);
        return Results.Ok(result);
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
});

app.MapPost("/api/auth/login", async (LoginRequest request, IAuthService authService) =>
{
    try
    {
        var result = await authService.LoginAsync(request);
        return Results.Ok(result);
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
});

app.MapGet("/api/auth/me", async (ClaimsPrincipal user, IAuthService authService) =>
{
    var userId = GetCurrentUserId(user);
    var userInfo = await authService.GetUserByIdAsync(userId);
    return userInfo != null ? Results.Ok(new { user = userInfo }) : Results.NotFound();
}).RequireAuthorization();

app.MapPost("/api/auth/logout", async (ClaimsPrincipal user, IUserService userService) =>
{
    var userId = GetCurrentUserId(user);
    await userService.LogoutUserAsync(userId);
    return Results.Ok(new { message = "Logout successful" });
}).RequireAuthorization();

// Channel endpoints
app.MapGet("/api/channels", async (ClaimsPrincipal user, IChannelService channelService) =>
{
    var userId = GetCurrentUserId(user);
    var channels = await channelService.GetChannelsForUserAsync(userId);
    return Results.Ok(new { channels });
}).RequireAuthorization();

app.MapGet("/api/channels/{id}", async (string id, ClaimsPrincipal user, IChannelService channelService) =>
{
    var userId = GetCurrentUserId(user);
    var channel = await channelService.GetChannelByIdAsync(id, userId);
    return channel != null ? Results.Ok(new { channel }) : Results.NotFound(new { message = "Channel not found" });
}).RequireAuthorization();

app.MapPost("/api/channels", async (CreateChannelRequest request, ClaimsPrincipal user, IChannelService channelService) =>
{
    try
    {
        var userId = GetCurrentUserId(user);
        var channel = await channelService.CreateChannelAsync(request, userId);
        return Results.Ok(new { channel });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
}).RequireAuthorization();

app.MapPost("/api/channels/{id}/join", async (string id, ClaimsPrincipal user, IChannelService channelService) =>
{
    try
    {
        var userId = GetCurrentUserId(user);
        await channelService.JoinChannelAsync(id, userId);
        return Results.Ok(new { message = "Joined channel successfully" });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
}).RequireAuthorization();

app.MapPost("/api/channels/{id}/leave", async (string id, ClaimsPrincipal user, IChannelService channelService) =>
{
    try
    {
        var userId = GetCurrentUserId(user);
        await channelService.LeaveChannelAsync(id, userId);
        return Results.Ok(new { message = "Left channel successfully" });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
}).RequireAuthorization();

app.MapPost("/api/channels/direct", async (CreateDirectMessageRequest request, ClaimsPrincipal user, IChannelService channelService) =>
{
    try
    {
        var userId = GetCurrentUserId(user);
        var channel = await channelService.CreateDirectMessageAsync(request, userId);
        return Results.Ok(new { channel });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
}).RequireAuthorization();

// Message endpoints
app.MapGet("/api/messages/channel/{channelId}", async (string channelId, ClaimsPrincipal user, IMessageService messageService, int page = 1, int limit = 50) =>
{
    try
    {
        var userId = GetCurrentUserId(user);
        var result = await messageService.GetMessagesForChannelAsync(channelId, userId, page, limit);
        return Results.Ok(result);
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
}).RequireAuthorization();

app.MapPost("/api/messages", async (SendMessageRequest request, ClaimsPrincipal user, IMessageService messageService, IHubContext<ChatHub> hubContext) =>
{
    try
    {
        var userId = GetCurrentUserId(user);
        var message = await messageService.SendMessageAsync(request, userId);
        
        // Emit message to channel subscribers via SignalR
        await hubContext.Clients.Group($"channel:{request.ChannelId}").SendAsync("message:new", new { message });
        
        return Results.Ok(new { message });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
}).RequireAuthorization();

app.MapPut("/api/messages/{id}", async (string id, EditMessageRequest request, ClaimsPrincipal user, IMessageService messageService, IHubContext<ChatHub> hubContext) =>
{
    try
    {
        var userId = GetCurrentUserId(user);
        var message = await messageService.EditMessageAsync(id, request, userId);
        
        // Emit message update to channel subscribers
        await hubContext.Clients.Group($"channel:{message.Channel}").SendAsync("message:edited", new { message });
        
        return Results.Ok(new { message });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
}).RequireAuthorization();

app.MapDelete("/api/messages/{id}", async (string id, ClaimsPrincipal user, IMessageService messageService, IHubContext<ChatHub> hubContext, AppDbContext context) =>
{
    try
    {
        var userId = GetCurrentUserId(user);
        
        // Get message channel before deletion for SignalR notification
        var message = await context.Messages.FirstOrDefaultAsync(m => m.Id == id);
        var channelId = message?.Channel;
        
        await messageService.DeleteMessageAsync(id, userId);
        
        // Emit message deletion to channel subscribers
        if (!string.IsNullOrEmpty(channelId))
        {
            await hubContext.Clients.Group($"channel:{channelId}").SendAsync("message:deleted", new { messageId = id });
        }
        
        return Results.Ok(new { message = "Message deleted successfully" });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
}).RequireAuthorization();

app.MapPost("/api/messages/{id}/reactions", async (string id, AddReactionRequest request, ClaimsPrincipal user, IMessageService messageService, IHubContext<ChatHub> hubContext, AppDbContext context) =>
{
    try
    {
        var userId = GetCurrentUserId(user);
        var reactions = await messageService.AddReactionAsync(id, request, userId);
        
        // Get message channel for SignalR notification
        var message = await context.Messages.FirstOrDefaultAsync(m => m.Id == id);
        if (message != null)
        {
            await hubContext.Clients.Group($"channel:{message.Channel}").SendAsync("message:reaction", new
            {
                messageId = id,
                emoji = request.Emoji,
                userId,
                reactions
            });
        }
        
        return Results.Ok(new { reactions });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
}).RequireAuthorization();

// User endpoints
app.MapGet("/api/users", async (ClaimsPrincipal user, IUserService userService) =>
{
    var userId = GetCurrentUserId(user);
    var users = await userService.GetAllUsersAsync(userId);
    return Results.Ok(new { users });
}).RequireAuthorization();

app.MapGet("/api/users/{id}", async (string id, IUserService userService) =>
{
    var userInfo = await userService.GetUserByIdAsync(id);
    return userInfo != null ? Results.Ok(new { user = userInfo }) : Results.NotFound(new { message = "User not found" });
}).RequireAuthorization();

app.MapPut("/api/users/profile", async (UpdateProfileRequest request, ClaimsPrincipal user, IUserService userService) =>
{
    try
    {
        var userId = GetCurrentUserId(user);
        var userInfo = await userService.UpdateUserProfileAsync(userId, request);
        return Results.Ok(new { user = userInfo });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
}).RequireAuthorization();

app.MapGet("/api/users/search/{query}", async (string query, ClaimsPrincipal user, IUserService userService) =>
{
    try
    {
        var userId = GetCurrentUserId(user);
        var users = await userService.SearchUsersAsync(query, userId);
        return Results.Ok(new { users });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
}).RequireAuthorization();

// Map SignalR Hub
app.MapHub<ChatHub>("/chatHub");

app.Run();