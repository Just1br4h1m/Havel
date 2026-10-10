using System.Security.Claims;
using System.Security.Cryptography;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Havel.Application.Abstractions.Repositories;
using Havel.Application.Abstractions.Services;
using Havel.Application.Models.Auth;
using Havel.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Havel.Infrastructure.Services;

public class AuthenticationService: IAuthenticationService
{
    private const int REFRESH_TOKEN_EXPIRY_TIME = 7;
    
    private readonly IConfiguration  _configuration;
    private readonly IUserRepository _userRepository;

    public AuthenticationService(
        IConfiguration configuration, 
        IUserRepository userRepository)
    {
        _configuration = configuration;
        _userRepository = userRepository;
    }
    
    
    public async Task<TokenDto> CreateTokenAsync(UserEntity? userEntity, CancellationToken cancellationToken)
    {
        return new TokenDto
        {
            AccessToken = CreateToken(userEntity),
            RefreshToken = await GenerateAndSaveRefreshToken(userEntity, cancellationToken),
        };
    }

    public async Task<TokenDto> RefreshTokenAsync(RefreshTokenRequestDto request, CancellationToken cancellationToken)
    {
        UserEntity? userEntity 
            = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        
        if (userEntity == null)
            throw new ArgumentException($"User with id {request.UserId} not found");
        
        bool isTokenValid 
            = await ValidateRefreshTokenAsync(userEntity.Id, request.RefreshToken, cancellationToken);

        if (!isTokenValid)
        {
            string newAccessToken = CreateToken(userEntity);
            string newRefreshToken = await GenerateAndSaveRefreshToken(userEntity, cancellationToken);

            return new TokenDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken
            };
        }

        return new TokenDto
        {
            AccessToken = CreateToken(userEntity),
            RefreshToken = userEntity.RefreshToken ?? string.Empty
        };
    }
    
    
    //HELPER METHODS

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private async Task<string> GenerateAndSaveRefreshToken(UserEntity userEntity, CancellationToken cancellationToken)
    {
        string refreshToken = GenerateRefreshToken();
        userEntity.RefreshToken = refreshToken;
        userEntity.RefreshTokenExpires = DateTime.UtcNow.AddDays(REFRESH_TOKEN_EXPIRY_TIME);
        await _userRepository.EditAsync(userEntity, cancellationToken);
        
        return refreshToken;
    }

    private string CreateToken(UserEntity userEntity)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userEntity.Id.ToString()),
            new Claim(ClaimTypes.Role, userEntity.Role.ToString()),
            new Claim(ClaimTypes.Email, userEntity.Email)
        };
        
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration.GetValue<string>("AppSettings:Token")!));

        var creds = new SigningCredentials(
            key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new JwtSecurityToken(
            issuer: _configuration.GetValue<string>("AppSettings:Issuer"),
            audience: _configuration.GetValue<string>("AppSettings:Audience"),
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(30),
            signingCredentials: creds
        );
        
        return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
    }

    private async Task<bool> ValidateRefreshTokenAsync(
        Guid userId, string refreshToken,
        CancellationToken cancellationToken)
    {
        UserEntity? userEntity =
            await _userRepository.GetByIdAsync(userId, cancellationToken);

        if (userEntity.RefreshToken != refreshToken || 
            userEntity.RefreshTokenExpires <= DateTime.UtcNow)
        {
            return false;
        }
        
        return true;
    }
}