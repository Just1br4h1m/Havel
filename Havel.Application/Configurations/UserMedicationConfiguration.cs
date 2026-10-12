using Havel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Havel.Application.Configurations;

public sealed class UserMedicationConfiguration: IEntityTypeConfiguration<UserMedicationEntity>
{
    void IEntityTypeConfiguration<UserMedicationEntity>.Configure(EntityTypeBuilder<UserMedicationEntity> builder)
    {
        builder
            .Property(u => u.FoodTiming)
            .HasConversion<string>();
        
    }
}