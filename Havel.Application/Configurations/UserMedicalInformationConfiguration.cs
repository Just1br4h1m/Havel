using Havel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Havel.Application.Configurations;

public sealed class UserMedicalInformationConfiguration: IEntityTypeConfiguration<UserMedicalInformationEntity>
{
    void IEntityTypeConfiguration<UserMedicalInformationEntity>.Configure(EntityTypeBuilder<UserMedicalInformationEntity> builder)
    {
        builder
            .Property(u => u.BloodGroup)
            .HasConversion<string>();
        
        builder
            .Property(u => u.Genotype)
            .HasConversion<string>();
    }
}