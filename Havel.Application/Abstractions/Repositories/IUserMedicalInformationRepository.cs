using Havel.Domain.Entities;

namespace Havel.Application.Abstractions.Repositories;

public interface IUserMedicalInformationRepository
{
    Task CreateAsync(UserMedicalInformationEntity  userMedicalInformation, CancellationToken cancellationToken);
    Task EditAsync(UserMedicalInformationEntity  userMedicalInformation, CancellationToken cancellationToken);
    Task<UserMedicalInformationEntity> RetrieveAsync(Guid userId, CancellationToken cancellationToken);
}