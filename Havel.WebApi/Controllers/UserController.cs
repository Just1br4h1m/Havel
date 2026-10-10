using Havel.Application.Abstractions.Services;
using Havel.Application.Models;
using Havel.Application.Models.UserMedical;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Havel.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly ILogger<UserController> _logger;
    private readonly IUserService _userService;
    
    public UserController(ILogger<UserController> logger, IUserService userService)
    {
        _logger = logger;
        _userService = userService;
    }
    
    [HttpGet("retrieve-user")]
    public async Task<ActionResult<UserDto>> GetUser(
        [FromHeader] Guid userId, 
        CancellationToken cancellationToken)
    {
        UserDto user = await _userService.GetAsync(userId, cancellationToken);
        return Ok(user);
    }
    
    [HttpPost("register-medical")]
    public async Task<ActionResult<MedicalDetailsDto>> RegisterMedical(
        [FromHeader] Guid userId,
        [FromBody] MedicalDto dto,
        CancellationToken cancellationToken
    )
    {
        MedicalDetailsDto medical = await _userService.RegisterMedicalAsync(userId, dto, cancellationToken);
        return Ok(medical);
    }
    
    [HttpGet("retrieve-medical")]
    public async Task<ActionResult<MedicalDetailsDto>> GetMedical(
        [FromHeader] Guid userId,
        CancellationToken cancellationToken)
    {
        MedicalDetailsDto medical = await _userService.GetMedicalAsync(userId, cancellationToken);
        return Ok(medical);
    }

    [HttpPut("update")]
    public async Task<ActionResult<UserDto>> UpdateUser(
        [FromHeader] Guid userId,
        [FromBody] UpdateUserDto user, 
        CancellationToken cancellationToken)
    {
        UserDto updatedUser = await _userService.UpdateAsync(user, userId, cancellationToken);
        return Ok(updatedUser);
    }

    [HttpPut("update-medical")]
    public async Task<ActionResult<MedicalDetailsDto>> UpdateMedical(
        [FromHeader] Guid userId,
        [FromBody] MedicalDto dto,
        CancellationToken cancellationToken
    )
    {
        MedicalDetailsDto medical = await _userService.UpdateMedicalAsync(dto, userId, cancellationToken);
        return Ok(medical);
    }

    [HttpDelete("delete-user")]
    public async Task<ActionResult<bool>> DeleteUser(
        [FromHeader] Guid userId, 
        CancellationToken cancellationToken)
    {
        bool deleted = await _userService.DeleteAsync(userId, cancellationToken);
        return deleted;
    }
    
    
}