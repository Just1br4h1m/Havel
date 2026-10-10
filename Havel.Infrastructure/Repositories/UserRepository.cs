using Havel.Application.Abstractions.Repositories;
using Havel.Application.Abstractions.Services;
using Havel.Infrastructure.Contexts;
using Havel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Havel.Infrastructure.Repositories;

public sealed class UserRepository: IUserRepository
{
    private readonly HavelContext _context;
    private readonly IHashingService  _hashingService;
    
    public UserRepository(HavelContext context, IHashingService hashingService)
    {
        _context = context;
        _hashingService = hashingService;
    }
    
    public Task CreateAsync(UserEntity userEntity, CancellationToken cancellationToken)
    {
        _context.Users.AddAsync(userEntity, cancellationToken);
        return _context.SaveChangesAsync(cancellationToken);
    }

    public Task DeleteAsync(UserEntity userEntity, CancellationToken cancellationToken)
    {
        _context.Users.Remove(userEntity);
        return _context.SaveChangesAsync(cancellationToken);
    }

    public Task EditAsync(UserEntity userEntity, CancellationToken cancellationToken)
    {
        EntityEntry entry = _context.Entry(userEntity);
        entry.State = EntityState.Modified;
        return _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<UserEntity> GetByIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        UserEntity? userEntity = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        return userEntity ?? throw new KeyNotFoundException();
    }

    public async Task<UserEntity> GetByEmailAsync(string email, CancellationToken cancellationToken)
    {
        string hashedEmail = _hashingService.ComputeDeterministicHash(email);
        
        UserEntity? userEntity = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.EmailHash == hashedEmail, cancellationToken);
        
        return userEntity ??  throw new KeyNotFoundException();
    }

    public async Task<List<UserEntity>> ListAsync(CancellationToken cancellationToken)
    {
        return await 
            _context.Users
                .AsNoTracking()
                .ToListAsync(cancellationToken);
    }
    
}