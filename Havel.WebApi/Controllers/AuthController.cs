using Havel.Application.Abstractions.Services;
using Havel.Application.Models;
using Havel.Application.Models.Auth;
using Havel.Application.Models.UserMedical;
using Microsoft.AspNetCore.Mvc;

namespace Havel.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ILogger<AuthController> _logger;
    private readonly IUserService _userService;

    public AuthController(
        ILogger<AuthController> logger, 
        IUserService userService)
    {
        _logger = logger;
        _userService = userService;
    }
    
    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(
        [FromBody] LoginDto login, 
        CancellationToken  cancellationToken)
    {
        Guid userId = await _userService.RegisterAsync(login, cancellationToken);
        return Ok(userId);
    }
    
    [HttpPost("login")]
    public async Task<ActionResult<TokenDto>> Login(
        [FromBody] LoginDto login, 
        CancellationToken cancellationToken)
    {
        TokenDto token = await _userService.LoginAsync(login, cancellationToken);
        return Ok(token);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<TokenDto>> RefreshToken(
        [FromBody] RefreshTokenRequestDto request,
        CancellationToken cancellationToken
    )
    {
        TokenDto token = await _userService.RefreshTokenAsync(request, cancellationToken);
        return Ok(token);
    }
}