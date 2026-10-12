using Havel.Application.Models.Medication;
using Havel.Domain.Entities;

namespace Havel.Application.Abstractions.Services;

public interface IMedicationScheduleService
{
    Task<DetailsScheduleDto> ScheduleMedicationAsync(Guid userId, CreateScheduleDto medicationSchedule,
        CancellationToken cancellationToken);
    
    Task DeleteMedicationScheduleAsync(Guid scheduleId, CancellationToken cancellationToken);
    
    Task<ScheduleAggregate> RetrieveMedicationSchedulesAsync(Guid userId, CancellationToken cancellationToken);
    
    Task<DetailsScheduleDto> UpdateMedicationScheduleAsync(Guid scheduleId, CreateScheduleDto medicationSchedule, 
        CancellationToken cancellationToken);
}