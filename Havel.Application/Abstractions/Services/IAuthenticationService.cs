using Havel.Application.Models.Auth;
using Havel.Domain.Entities;

namespace Havel.Application.Abstractions.Services;

public interface IAuthenticationService
{
    Task<TokenDto> CreateTokenAsync(UserEntity? userEntity, CancellationToken cancellationToken);
    Task<TokenDto> RefreshTokenAsync(RefreshTokenRequestDto request, CancellationToken cancellationToken);
}