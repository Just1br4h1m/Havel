using Havel.Application.Models.Medication;
using Havel.Domain.Entities;

namespace Havel.Application.Abstractions.Repositories;

public interface IUserMedicationRepository
{
    Task CreateAsync(UserMedicationEntity userMedicationEntity, CancellationToken cancellationToken);
    Task DeleteAsync(UserMedicationEntity userMedicationEntity, CancellationToken cancellationToken);
    Task<List<UserMedicationEntity>>  RetrieveByUserIdAsync(Guid userId, CancellationToken cancellationToken);
    Task<UserMedicationEntity?> RetrieveByScheduleIdAsync(Guid scheduleId, CancellationToken cancellationToken);
    Task UpdateAsync (UserMedicationEntity userMedicationEntity, CancellationToken cancellationToken);
}