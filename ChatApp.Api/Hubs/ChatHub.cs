using Microsoft.AspNetCore.SignalR;
using ChatApp.Api.Models;
using System.Collections.Concurrent;

namespace ChatApp.Api.Hubs;

public class ChatHub : Hub
{
    private static readonly ConcurrentDictionary<string, UserStatus> _users = new();

    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }

    public async Task SendPrivateMessage(string fromUser, string toUser, string message)
    {
        var targetUser = _users.FirstOrDefault(u => u.Value.UserName == toUser);
        if (targetUser.Value != null)
        {
            await Clients.Client(targetUser.Key).SendAsync("ReceivePrivateMessage", fromUser, toUser, message);
            await Clients.Caller.SendAsync("ReceivePrivateMessage", fromUser, toUser, message);
        }
    }

    public override async Task OnConnectedAsync()
    {
        var userName = Context.GetHttpContext()?.Request.Query["user"].ToString() ?? "Anonymous";
        var userStatus = new UserStatus
        {
            UserName = userName,
            IsOnline = true,
            LastSeen = DateTime.UtcNow
        };

        _users.TryAdd(Context.ConnectionId, userStatus);
        await Clients.All.SendAsync("UserStatusChanged", _users.Values.ToList());
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if(_users.TryRemove(Context.ConnectionId, out var userStatus))
        {
            userStatus.IsOnline = false;
            userStatus.LastSeen = DateTime.UtcNow;
            await Clients.All.SendAsync("UserStatusChanged", _users.Values.ToList());
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task GetUserList()
    {
        await Clients.Caller.SendAsync("UserStatusChanged", _users.Values.ToList());
    }
}