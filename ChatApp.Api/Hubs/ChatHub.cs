using Microsoft.AspNetCore.SignalR;
using ChatApp.Api.Models;
using System.Collections.Concurrent;
using ChatApp.Api.Data;

namespace ChatApp.Api.Hubs;

public class ChatHub : Hub
{
    private static readonly ConcurrentDictionary<string, UserStatus> _users = new();
    private readonly AppDbContext _context;

    public ChatHub(AppDbContext context)
    {
        _context = context;
    }

    public async Task SendMessage(string user, string message)
    {
        var chatMessage = new ChatMessage
        {
            User = user,
            Message = message,
            Timestamp = DateTime.UtcNow,
            IsPrivate = false
        };

        _context.Messages.Add(chatMessage);
        await _context.SaveChangesAsync();

        await Clients.All.SendAsync("ReceiveMessage", user, message);
        
        var otherUsers = _users.Where(u => u.Value.UserName != user);
        foreach (var otherUser in otherUsers)
        {
            await Clients.Client(otherUser.Key).SendAsync("ReceiveNotification", user, message, false);
        }
    }

    public async Task SendPrivateMessage(string fromUser, string toUser, string message)
    {
        var chatMessage = new ChatMessage
        {
            User = fromUser,
            Message = message,
            Timestamp = DateTime.UtcNow,
            IsPrivate = true,
            ToUser = toUser
        };

        _context.Messages.Add(chatMessage);
        await _context.SaveChangesAsync();

        var targetUser = _users.FirstOrDefault(u => u.Value.UserName == toUser);
        if (targetUser.Value != null)
        {
            await Clients.Client(targetUser.Key).SendAsync("ReceivePrivateMessage", fromUser, toUser, message);
            await Clients.Caller.SendAsync("ReceivePrivateMessage", fromUser, toUser, message);
            
            await Clients.Client(targetUser.Key).SendAsync("ReceiveNotification", fromUser, message, true);
        }
    }

    public async Task UserIsTyping(string userName, bool isTyping)
    {
        await Clients.All.SendAsync("UserTypingStatusChanged", userName, isTyping);
    }

    public async Task UserIsTypingPrivate(string fromUser, string toUser, bool isTyping)
    {
        var targetUser = _users.FirstOrDefault(u => u.Value.UserName == toUser);
        if (targetUser.Value != null)
        {
            await Clients.Client(targetUser.Key).SendAsync("UserTypingStatusChangedPrivate", fromUser, isTyping);
            await Clients.Caller.SendAsync("UserTypingStatusChangedPrivate", fromUser, isTyping);
        }
    }

    public override async Task OnConnectedAsync()
    {
        var userName = Context.GetHttpContext()?.Request.Query["user"].ToString() ?? "Anonymous";
        
        var existingOnlineUser = _users.Values.FirstOrDefault(u => u.UserName == userName && u.IsOnline);
        if (existingOnlineUser != null)
        {
            await Clients.Client(existingOnlineUser.ConnectionId).SendAsync("ForceDisconnect", "Bu kullanıcı adı başka bir oturumda kullanılıyor.");
            _users.TryRemove(existingOnlineUser.ConnectionId, out _);
        }

        var userStatus = new UserStatus
        {
            UserName = userName,
            IsOnline = true,
            LastSeen = DateTime.UtcNow,
            ConnectionId = Context.ConnectionId
        };
        _users.TryAdd(Context.ConnectionId, userStatus);

        await Clients.All.SendAsync("UserStatusChanged", _users.Values.ToList());
        await Clients.All.SendAsync("ConnectionNotification", userName, true, DateTime.UtcNow);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (_users.TryGetValue(Context.ConnectionId, out var userStatus))
        {
            await Clients.All.SendAsync("ConnectionNotification", userStatus.UserName, false, DateTime.UtcNow);
            _users.TryRemove(Context.ConnectionId, out _);
            await Clients.All.SendAsync("UserStatusChanged", _users.Values.ToList());
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task GetUserList()
    {
        await Clients.Caller.SendAsync("UserStatusChanged", _users.Values.ToList());
    }
}