using Havel.Domain.Enums;

namespace Havel.Domain.Entities;

public class UserEntity
{
    public Guid Id { get; set; }
    public string? FirstName { get; set => field = value; }
    public string? LastName { get; set => field = value; }
    public Gender Gender { get; set; }
    public Role Role { get; set; }
    public string Email { get; set => field = value; }
    public string? EmailHash { get; set => field = value; }
    public string? Telephone { get; set => field = value; }
    public string? TelephoneHash { get; set => field = value; }
    public string PasswordHash  { get; set => field = value; }
    public string PasswordSalt { get; set => field = value; }
    public DateOnly DateOfBirth { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpires { get; set; }

    public UserMedicalInformationEntity? UserMedicalInformation { get; set; }
}

