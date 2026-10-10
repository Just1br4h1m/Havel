using Havel.Application.Abstractions.Repositories;
using Havel.Domain.Entities;
using Havel.Infrastructure.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Havel.Infrastructure.Repositories;

public sealed class UserMedicalInformationRepository: IUserMedicalInformationRepository
{
    private HavelContext _context;
    
    public UserMedicalInformationRepository(HavelContext context)
    {
        _context = context;
    }
    
    public Task CreateAsync(UserMedicalInformationEntity userMedicalInformation, CancellationToken cancellationToken)
    {
        _context.UsersMedicalInformation.AddAsync(userMedicalInformation, cancellationToken);
        return _context.SaveChangesAsync(cancellationToken);
    }

    public Task EditAsync(UserMedicalInformationEntity userMedicalInformation, CancellationToken cancellationToken)
    {
        EntityEntry entry = _context.UsersMedicalInformation.Entry(userMedicalInformation);
        entry.State = EntityState.Modified;
        return _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<UserMedicalInformationEntity> RetrieveAsync(Guid userId, CancellationToken cancellationToken)
    {
        UserMedicalInformationEntity? userMedicalInformation = await _context.UsersMedicalInformation
            .Where(x => x.UserId == userId)
            .FirstOrDefaultAsync(cancellationToken);

        return userMedicalInformation ?? new UserMedicalInformationEntity();
    }

    public Task DeleteAsync(UserMedicalInformationEntity  userMedicalInformation, CancellationToken cancellationToken)
    {
        _context.UsersMedicalInformation.Remove(userMedicalInformation);
        return _context.SaveChangesAsync(cancellationToken);
    }
}