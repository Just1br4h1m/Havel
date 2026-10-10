using Havel.Application.Models;

namespace Havel.Application.Abstractions.Services;

public interface IHashingService
{
    public PasswordDto CreateHashAndSalt(string password);
    public bool CheckPassword(string password, string hash, string salt);
    public string ComputeDeterministicHash(string text);
}