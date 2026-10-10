using Havel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Havel.Application.Configurations;

public sealed class UserConfiguration: IEntityTypeConfiguration<UserEntity>
{
    void IEntityTypeConfiguration<UserEntity>.Configure(EntityTypeBuilder<UserEntity> builder)
    {
        builder
            .Property(u => u.Role)
            .HasConversion<string>();
        
        builder
            .Property(u => u.Gender)
            .HasConversion<string>();
        
        builder
            .HasIndex(u => u.EmailHash)
            .IsUnique();
        
        builder
            .HasIndex(u => u.TelephoneHash)
            .IsUnique();

        builder
            .Property(u => u.DateOfBirth)
            .HasConversion<string>();
        
        builder
            .HasOne(u => u.UserMedicalInformation)
            .WithOne(u => u.User)
            .HasForeignKey<UserMedicalInformationEntity>(u => u.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}