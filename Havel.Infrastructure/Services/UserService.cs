using AutoMapper;
using Havel.Application.Abstractions.Repositories;
using Havel.Application.Abstractions.Services;
using Havel.Application.Models;
using Havel.Application.Models.Auth;
using Havel.Application.Models.UserMedical;
using Havel.Domain.Entities;

namespace Havel.Infrastructure.Services;

public class UserService(
    IAuthenticationService authenticationService,
    IMapper mapper,
    IHashingService hashing,
    IUserRepository userRepository,
    IUserMedicalInformationRepository medicalInformationRepository
)
    : IUserService
{
    public async Task<Guid> RegisterAsync(LoginDto login, CancellationToken cancellationToken)
    {
        PasswordDto password = hashing.CreateHashAndSalt(login.Password);
        
        string emailHash = hashing.ComputeDeterministicHash(login.Email); 
        
        UserEntity userEntity = new UserEntity
        {
            Email = login.Email,
            EmailHash = emailHash,
            PasswordHash = password.passwordHash,
            PasswordSalt = password.passwordSalt,
            IsActive = true,
            CreatedAt =  DateTime.UtcNow,
            UpdatedAt =  DateTime.UtcNow
        };
        
        await userRepository.CreateAsync(userEntity, cancellationToken);
        
        return userEntity.Id;
    }

    public async Task<MedicalDetailsDto> RegisterMedicalAsync(Guid userId, MedicalDto dto, CancellationToken cancellationToken)
    {
        UserEntity? userEntity 
            = await userRepository.GetByIdAsync(userId, cancellationToken);
        
        if (userEntity == null)
            throw new ArgumentException($"User with id {userId} not found");
        
        UserMedicalInformationEntity medicalInformationEntity = mapper.Map<UserMedicalInformationEntity>(dto);
        medicalInformationEntity.UserId = userId;
        await medicalInformationRepository.CreateAsync(medicalInformationEntity, cancellationToken);
        
        return mapper.Map<MedicalDetailsDto>(medicalInformationEntity);
    }

    public async Task<TokenDto> LoginAsync(LoginDto login, CancellationToken cancellationToken)
    {
        UserEntity? userEntity = await userRepository.GetByEmailAsync(login.Email, cancellationToken);
        if (userEntity == null)
            throw new ArgumentException($"User with email {login.Email} not found");
        
        bool isValid = hashing.CheckPassword(login.Password, userEntity.PasswordHash, userEntity.PasswordSalt);
        if (!isValid)
            throw new ArgumentException($"Email or password is incorrect");
        
        TokenDto fullToken = await authenticationService.CreateTokenAsync(userEntity, cancellationToken);
        
        return fullToken;
    }
    
    public async Task<TokenDto> RefreshTokenAsync(RefreshTokenRequestDto request, CancellationToken cancellationToken)
    {
        TokenDto token = await authenticationService.RefreshTokenAsync(request, cancellationToken);
        return token;
    }

    public async Task<UserDto> GetAsync(Guid userId, CancellationToken cancellationToken)
    {
        UserEntity? userEntity = await userRepository.GetByIdAsync(userId, cancellationToken);
        if (userEntity == null)
            throw new ArgumentException($"User with id {userId} not found");
        
        return mapper.Map<UserDto>(userEntity);
    }

    public async Task<MedicalDetailsDto> GetMedicalAsync(Guid userId, CancellationToken cancellationToken)
    {
        UserMedicalInformationEntity? medicalInformationEntity = await medicalInformationRepository
            .RetrieveAsync(userId, cancellationToken);
        
        if (medicalInformationEntity == null)
            throw new ArgumentException($"Medical {userId} not found");
        
        return mapper.Map<MedicalDetailsDto>(medicalInformationEntity);
    }

    public async Task<UserDto> UpdateAsync(UpdateUserDto user, Guid userId, CancellationToken cancellationToken)
    {
        string telephoneHash = hashing.ComputeDeterministicHash(user.Telephone);
        
        UserEntity? userEntity = await userRepository.GetByIdAsync(userId, cancellationToken);
        if (userEntity == null)
            throw new ArgumentException($"User with email {userId} not found");
        
        mapper.Map(user, userEntity);
        userEntity.TelephoneHash = telephoneHash;
        
        await userRepository.EditAsync(userEntity, cancellationToken);
        
        return mapper.Map<UserDto>(userEntity);
    }

    public async Task<MedicalDetailsDto> UpdateMedicalAsync(MedicalDto dto, Guid userId, CancellationToken cancellationToken)
    {
        UserMedicalInformationEntity? medicalInformationEntity = await medicalInformationRepository
            .RetrieveAsync(userId, cancellationToken);
        
        if (medicalInformationEntity == null)
            throw new ArgumentException($"Medical {userId} not found");
        
        mapper.Map(dto, medicalInformationEntity);
        
        await medicalInformationRepository.EditAsync(medicalInformationEntity, cancellationToken);
        
        return mapper.Map<MedicalDetailsDto>(medicalInformationEntity);
    }

    public async Task<bool> DeleteAsync(Guid userId, CancellationToken cancellationToken)
    {
        UserEntity? userEntity = await userRepository.GetByIdAsync(userId, cancellationToken);
        if (userEntity == null)
            throw new ArgumentException($"User with id {userId} not found");
        
        await  userRepository.DeleteAsync(userEntity, cancellationToken);
        return true;
    }
    
}