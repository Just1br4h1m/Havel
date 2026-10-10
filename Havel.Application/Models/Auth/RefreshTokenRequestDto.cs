namespace Havel.Application.Models.Auth;

public record RefreshTokenRequestDto(
    Guid UserId,
    string RefreshToken
);