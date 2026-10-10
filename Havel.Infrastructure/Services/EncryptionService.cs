using System.Text;
using System.Security.Cryptography;
using Havel.Application.Abstractions.Services;
using Microsoft.Extensions.Configuration;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Crypto.Modes;
using Org.BouncyCastle.Crypto.Parameters;

namespace Havel.Infrastructure.Services;

public sealed class EncryptionService : IEncryptionService
{
    private readonly string _encryptionPassword;
    
    private const int KEY_LENGTH_BITS = 256;      
    private const int SALT_LENGTH_BYTES = 16;     
    private const int IV_LENGTH_BYTES = 12;       
    private const int TAG_LENGTH_BITS = 128;      
    private const int PBKDF2_ITERATIONS = 100_000; 
    
    public EncryptionService(IConfiguration configuration)
    {
        _encryptionPassword = configuration.GetValue<string>("AppSettings:EncryptionPassword") 
            ?? throw new InvalidOperationException("Encryption password is not configured.");
    }

    public string Encrypt(string plainText)
    {
        if (string.IsNullOrEmpty(plainText)) return plainText;

        byte[] salt = GetRandomBytes(SALT_LENGTH_BYTES);
        byte[] iv = GetRandomBytes(IV_LENGTH_BYTES);
        byte[] key = DeriveKey(_encryptionPassword, salt, PBKDF2_ITERATIONS, KEY_LENGTH_BITS);

        GcmBlockCipher cipher = new GcmBlockCipher(new Org.BouncyCastle.Crypto.Engines.AesEngine());
        AeadParameters parameters = new AeadParameters(new KeyParameter(key), TAG_LENGTH_BITS, iv, null);

        cipher.Init(true, parameters);

        byte[] inputBytes = Encoding.UTF8.GetBytes(plainText);
        byte[] cipherText = new byte[cipher.GetOutputSize(inputBytes.Length)];

        int len = cipher.ProcessBytes(inputBytes, 0, inputBytes.Length, cipherText, 0);
        cipher.DoFinal(cipherText, len);
        
        byte[] result = new byte[iv.Length + salt.Length + cipherText.Length];
        Buffer.BlockCopy(iv, 0, result, 0, iv.Length);
        Buffer.BlockCopy(salt, 0, result, iv.Length, salt.Length);
        Buffer.BlockCopy(cipherText, 0, result, iv.Length + salt.Length, cipherText.Length);

        return Convert.ToBase64String(result);
    }

    public string Decrypt(string cipherText)
    {
        if (string.IsNullOrEmpty(cipherText)) 
            return cipherText;

        byte[] input = Convert.FromBase64String(cipherText);

        byte[] iv = new byte[IV_LENGTH_BYTES];
        byte[] salt = new byte[SALT_LENGTH_BYTES];
        byte[] cipherTextBytes = new byte[input.Length - IV_LENGTH_BYTES - SALT_LENGTH_BYTES];
        
        Buffer.BlockCopy(input, 0, iv, 0, iv.Length);
        Buffer.BlockCopy(input, iv.Length, salt, 0, salt.Length);
        Buffer.BlockCopy(input, iv.Length + salt.Length, cipherTextBytes, 0, cipherTextBytes.Length);

        byte[] key = DeriveKey(_encryptionPassword, salt, PBKDF2_ITERATIONS, KEY_LENGTH_BITS);

        GcmBlockCipher cipher = new GcmBlockCipher(new Org.BouncyCastle.Crypto.Engines.AesEngine());
        AeadParameters parameters = new AeadParameters(new KeyParameter(key), TAG_LENGTH_BITS, iv, null);

        cipher.Init(false, parameters);

        byte[] plainText = new byte[cipher.GetOutputSize(cipherTextBytes.Length)];

        int len = cipher.ProcessBytes(cipherTextBytes, 0, cipherTextBytes.Length, plainText, 0);
        int finalLen = cipher.DoFinal(plainText, len);

        return Encoding.UTF8.GetString(plainText, 0, len + finalLen);
    }

    private static byte[] DeriveKey(string password, byte[] salt, int iterations, int keyLengthBits)
    {
        var gen = new Pkcs5S2ParametersGenerator(new Sha256Digest());
        gen.Init(PbeParametersGenerator.Pkcs5PasswordToBytes(password.ToCharArray()), salt, iterations);
        
        KeyParameter keyParam = (KeyParameter)gen.GenerateDerivedMacParameters(keyLengthBits);
        return keyParam.GetKey();
    }

    private static byte[] GetRandomBytes(int length)
    {
        byte[] bytes = new byte[length];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return bytes;
    }
}