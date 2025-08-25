using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IUserService
{
    Task<List<UserResponse>> GetAllUsersAsync(string currentUserId);
    Task<UserResponse?> GetUserByIdAsync(string userId);
    Task<UserResponse> UpdateUserProfileAsync(string userId, UpdateProfileRequest request);
    Task<List<UserResponse>> SearchUsersAsync(string query, string currentUserId);
    Task LogoutUserAsync(string userId);
}

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserResponse>> GetAllUsersAsync(string currentUserId)
    {
        var users = await _context.Users
            .Where(u => u.Id != currentUserId)
            .OrderBy(u => u.Username)
            .ToListAsync();

        return users.Select(MapToUserResponse).ToList();
    }

    public async Task<UserResponse?> GetUserByIdAsync(string userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        return user != null ? MapToUserResponse(user) : null;
    }

    public async Task<UserResponse> UpdateUserProfileAsync(string userId, UpdateProfileRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        if (string.IsNullOrWhiteSpace(request.Username))
        {
            throw new ArgumentException("Username is required");
        }

        // Check if username is already taken by another user
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username.Trim() && u.Id != userId);

        if (existingUser != null)
        {
            throw new InvalidOperationException("Username already taken");
        }

        user.Username = request.Username.Trim();
        if (!string.IsNullOrEmpty(request.Avatar))
        {
            user.Avatar = request.Avatar;
        }
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToUserResponse(user);
    }

    public async Task<List<UserResponse>> SearchUsersAsync(string query, string currentUserId)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Trim().Length < 2)
        {
            throw new ArgumentException("Search query must be at least 2 characters");
        }

        var users = await _context.Users
            .Where(u => u.Id != currentUserId && u.Username.ToLower().Contains(query.Trim().ToLower()))
            .Take(20)
            .OrderBy(u => u.Username)
            .ToListAsync();

        return users.Select(MapToUserResponse).ToList();
    }

    public async Task LogoutUserAsync(string userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user != null)
        {
            user.IsOnline = false;
            user.LastSeen = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
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

public class UpdateProfileRequest
{
    public string Username { get; set; } = string.Empty;
    public string? Avatar { get; set; }
}