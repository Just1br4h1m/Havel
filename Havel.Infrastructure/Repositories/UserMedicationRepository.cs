using Havel.Application.Abstractions.Repositories;
using Havel.Application.Models.Medication;
using Havel.Domain.Entities;
using Havel.Infrastructure.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Havel.Infrastructure.Repositories;

internal sealed class UserMedicationRepository: IUserMedicationRepository
{
    private readonly HavelContext _context;

    public UserMedicationRepository(HavelContext context)
    {
        _context = context;
    }
    
    public Task CreateAsync(UserMedicationEntity userMedicationEntity, CancellationToken cancellationToken)
    {
        _context.UsersMedications.AddAsync(userMedicationEntity, cancellationToken);
        return _context.SaveChangesAsync(cancellationToken);
    }

    public Task DeleteAsync(UserMedicationEntity userMedicationEntity, CancellationToken cancellationToken)
    {
        _context.UsersMedications.Remove(userMedicationEntity);
        return _context.SaveChangesAsync(cancellationToken);
    }

    public Task<List<UserMedicationEntity>> RetrieveByUserIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        return _context.UsersMedications
            .AsNoTracking()
            .Where(m => m.UserId == userId)
            .ToListAsync(cancellationToken);
    }

    public Task<UserMedicationEntity?> RetrieveByScheduleIdAsync(Guid scheduleId, CancellationToken cancellationToken)
    {
        return _context.UsersMedications
            .AsNoTracking()
            .Where(m => m.ScheduleId == scheduleId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public Task UpdateAsync(UserMedicationEntity userMedicationEntity, CancellationToken cancellationToken)
    {
        EntityEntry entry = _context.UsersMedications.Entry(userMedicationEntity);
        entry.State = EntityState.Modified;
        return _context.SaveChangesAsync(cancellationToken);
    }
}