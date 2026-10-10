using Havel.Domain.Entities;

namespace Havel.Application.Abstractions.Repositories;

public interface IUserRepository
{
    Task CreateAsync(UserEntity userEntity, CancellationToken cancellationToken);
    Task DeleteAsync(UserEntity userEntity, CancellationToken cancellationToken);
    Task EditAsync(UserEntity userEntity, CancellationToken cancellationToken);
    Task<UserEntity> GetByIdAsync(Guid userId, CancellationToken cancellationToken);
    Task<UserEntity> GetByEmailAsync(string email, CancellationToken cancellationToken);
    Task<List<UserEntity>> ListAsync(CancellationToken cancellationToken);
}