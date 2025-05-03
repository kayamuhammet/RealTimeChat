using ChatApp.Api.Data;
using Microsoft.AspNetCore.Mvc;

namespace ChatApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    public readonly AppDbContext _context;

    public ChatController(AppDbContext context)
    {
        _context = context;
    }


    public IActionResult GetMessages()
    {
        var messages = _context.Messages
            .OrderByDescending(m => m.Timestamp)
            .Take(50)
            .ToList();

        return Ok(messages);
    }
}