using ChatApp.Api.Data;
using Microsoft.AspNetCore.Mvc;

namespace ChatApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;

    public ChatController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("messages")]
    public IActionResult GetMessages([FromQuery] int count = 50)
    {
        var messages = _context.Messages
            .Where(m => !m.IsPrivate)
            .OrderBy(m => m.Timestamp)
            .Take(count)
            .ToList();

        return Ok(messages);
    }

    [HttpGet("messages/user/{username}")]
    public IActionResult GetUserMessages(string username, [FromQuery] int count = 50)
    {
        var messages = _context.Messages
            .Where(m => m.User == username && !m.IsPrivate)
            .OrderBy(m => m.Timestamp)
            .Take(count)
            .ToList();

        return Ok(messages);
    }

    [HttpGet("messages/private/{username}")]
    public IActionResult GetPrivateMessages(string username, [FromQuery] int count = 50)
    {
        var messages = _context.Messages
            .Where(m => m.IsPrivate && (m.User == username || m.ToUser == username))
            .OrderBy(m => m.Timestamp)
            .Take(count)
            .ToList();

        return Ok(messages);
    }

    [HttpGet("messages/search")]
    public IActionResult SearchMessages([FromQuery] string query, [FromQuery] int count = 50)
    {
        var messages = _context.Messages
            .Where(m => m.Message.Contains(query) && !m.IsPrivate)
            .OrderBy(m => m.Timestamp)
            .Take(count)
            .ToList();

        return Ok(messages);
    }
}