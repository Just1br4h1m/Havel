using System.Security.Cryptography;
using System.Text;
using Havel.Application.Abstractions.Services;
using Havel.Application.Models;
using Microsoft.Extensions.Configuration;

namespace Havel.Infrastructure.Services;

public class HashingService: IHashingService
{
    private readonly string key;
        
    private const int KeySize = 256 / 8;
    private const int Iterations = 10_000;
    private static readonly HashAlgorithmName _hashAlgorithmName = HashAlgorithmName.SHA256;
    private const char Delimiter = '/';

    public HashingService(IConfiguration configuration)
    {
        key = configuration.GetValue<string>("AppSettings:Key") 
               ?? throw new InvalidOperationException("Hashing key is not configured.");
    }
    
    public PasswordDto CreateHashAndSalt(string password)
    {
        byte[] saltBytes = GenerateSalt();
        string hashedPassword = HashPassword(password, saltBytes);
        string base64Salt = Convert.ToBase64String(saltBytes);

        return new PasswordDto(hashedPassword, base64Salt);
    }

    public bool CheckPassword(string password, string hash, string salt)
    {
        byte[] storedSaltBytes = Convert.FromBase64String(salt);
        byte[] enteredPasswordBytes = Encoding.UTF8.GetBytes(password);
        
        byte[] saltedPassword = new byte[enteredPasswordBytes.Length + storedSaltBytes.Length];
        Buffer.BlockCopy(enteredPasswordBytes, 0, saltedPassword, 0, enteredPasswordBytes.Length);
        Buffer.BlockCopy(storedSaltBytes, 0, saltedPassword, enteredPasswordBytes.Length, storedSaltBytes.Length);
        
        string enteredPasswordHash = HashPassword(password, storedSaltBytes);
        
        if (!string.Equals(enteredPasswordHash, hash))
            return false;
        
        return true;
    }
    
    //HELPER FUNCTIONS
    static string HashPassword(string password, byte[] salt)
    {
        using (var sha256 = new SHA256Managed())
        {
            byte[] passwordBytes = Encoding.UTF8.GetBytes(password);
            byte[] saltedPassword = new byte[passwordBytes.Length + salt.Length];
            
            Buffer.BlockCopy(passwordBytes, 0, saltedPassword, 0, passwordBytes.Length);
            Buffer.BlockCopy(salt, 0, saltedPassword, passwordBytes.Length, salt.Length);
            
            byte[] hashedBytes = sha256.ComputeHash(saltedPassword);
            
            byte[] hashedPasswordWithSalt = new byte[hashedBytes.Length +  salt.Length];
            Buffer.BlockCopy(salt, 0, hashedPasswordWithSalt, 0, salt.Length);
            Buffer.BlockCopy(hashedBytes, 0, hashedPasswordWithSalt, salt.Length, hashedBytes.Length);
            
            return Convert.ToBase64String(hashedPasswordWithSalt);
        }
    }

    public string ComputeDeterministicHash(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) 
            return string.Empty;
        
        byte[] keyBytes = Encoding.UTF8.GetBytes(key);
        byte[] messageBytes = Encoding.UTF8.GetBytes(text);
        
        byte[] hashBytes = HMACSHA256.HashData(keyBytes, messageBytes);
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }

    static byte[] GenerateSalt()
    {
        using (var rng = new RNGCryptoServiceProvider())
        {
            byte[] salt = new byte[16];
            rng.GetBytes(salt);
            return salt;
        }
    }
}

