namespace ChatApp.Api.Models;

public class UserStatus
{
    public string UserName { get; set; } = string.Empty;
    public bool IsOnline { get; set; }
    public DateTime LastSeen { get; set; } = DateTime.UtcNow;
}