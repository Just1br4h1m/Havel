using Havel.Application.Abstractions.Services;
using Havel.Application.Configurations;
using Havel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace Havel.Infrastructure.Contexts;

public class HavelContext: DbContext
{
    private readonly IEncryptionService _encryptionService;
    
    public DbSet<UserEntity>  Users { get; set; }
    public DbSet<UserMedicalInformationEntity> UsersMedicalInformation { get; set; }
    
    public HavelContext(DbContextOptions<HavelContext> options, IEncryptionService encryptionService)
        : base(options)
    {
        _encryptionService = encryptionService;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new UserMedicalInformationConfiguration());
        
        //Encryption Services
        modelBuilder.Entity<UserEntity>()
            .Property(u => u.FirstName)
            .HasConversion(
                u => _encryptionService.Encrypt(u),
                u => _encryptionService.Decrypt(u)
            );

        modelBuilder.Entity<UserEntity>()
            .Property(u => u.LastName)
            .HasConversion(
                u => _encryptionService.Encrypt(u),
                u => _encryptionService.Decrypt(u));
        
        modelBuilder.Entity<UserEntity>()
            .Property(u => u.DateOfBirth)
            .HasConversion(
                d => _encryptionService.Encrypt(d.ToString("yyyy-MM-dd")),
                s => string.IsNullOrEmpty(s) ? default : DateOnly.Parse(_encryptionService.Decrypt(s))
            );

        modelBuilder.Entity<UserEntity>()
            .Property(u => u.Email)
            .HasConversion(
                u => _encryptionService.Encrypt(u),
                u => _encryptionService.Decrypt(u));
        
        modelBuilder.Entity<UserEntity>()
            .Property(u => u.Telephone)
            .HasConversion(
                u => _encryptionService.Encrypt(u),
                u => _encryptionService.Decrypt(u));

        modelBuilder.Entity<UserMedicalInformationEntity>()
            .Property(u => u.PatientNumber)
            .HasConversion(
                u => _encryptionService.Encrypt(u),
                u => _encryptionService.Decrypt(u));

        modelBuilder.Entity<UserMedicalInformationEntity>()
            .Property(u => u.HospitalNumber)
            .HasConversion(
                u => _encryptionService.Encrypt(u),
                u => _encryptionService.Decrypt(u));
    }
}