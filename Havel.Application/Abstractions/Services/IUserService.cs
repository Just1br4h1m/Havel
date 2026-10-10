using Havel.Application.Models;
using Havel.Application.Models.Auth;
using Havel.Application.Models.UserMedical;

namespace Havel.Application.Abstractions.Services;

public interface IUserService
{
    Task<Guid> RegisterAsync(LoginDto login, CancellationToken cancellationToken);
    Task<MedicalDetailsDto> RegisterMedicalAsync(Guid userId, MedicalDto dto, CancellationToken cancellationToken);
    Task<TokenDto> LoginAsync(LoginDto login, CancellationToken cancellationToken);
    Task<UserDto> GetAsync(Guid userId, CancellationToken cancellationToken);
    Task<MedicalDetailsDto> GetMedicalAsync(Guid userId, CancellationToken cancellationToken);
    Task<UserDto> UpdateAsync(UpdateUserDto user, Guid userId, CancellationToken cancellationToken);
    Task<MedicalDetailsDto> UpdateMedicalAsync(MedicalDto dto, Guid userId, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid userId, CancellationToken cancellationToken);
    Task<TokenDto> RefreshTokenAsync(RefreshTokenRequestDto request, CancellationToken cancellationToken);
}