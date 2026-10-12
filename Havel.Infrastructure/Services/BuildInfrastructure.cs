using Havel.Application.Abstractions.Repositories;
using Havel.Application.Abstractions.Services;
using Havel.Infrastructure.Contexts;
using Havel.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Havel.Infrastructure.Services;
    
public static class BuildInfrastructure
{
    public static IServiceCollection RegisterServices(
        this IServiceCollection services,
        IConfiguration configuration,
        string? connectionString
    )
    {
        //Add context
        services.AddDbContext<HavelContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
                .UseSnakeCaseNamingConvention());
        
        //Build repos and services
        services.AddScoped<IAuthenticationService, AuthenticationService>();
        services.AddScoped<IEncryptionService, EncryptionService>();
        services.AddScoped<IHashingService, HashingService>();
        services.AddScoped<IMedicationScheduleService, MedicationScheduleService>();
        
        
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IUserMedicationRepository, UserMedicationRepository>();
        services.AddScoped<IUserMedicalInformationRepository, UserMedicalInformationRepository>();
        services.AddScoped<IUserService, UserService>();

        return services;
    }
}