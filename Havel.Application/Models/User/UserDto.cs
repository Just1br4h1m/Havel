using Havel.Domain.Enums;

namespace Havel.Application.Models;

public record UserDto(
    Guid Id,
    string FirstName,
    string LastName,
    Gender Gender,
    Role Role,
    string Email,
    string Telephone,
    DateOnly DateOfBirth
);