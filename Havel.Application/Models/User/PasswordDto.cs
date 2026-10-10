namespace Havel.Application.Models;

public record PasswordDto(
    string passwordHash,
    string passwordSalt
);