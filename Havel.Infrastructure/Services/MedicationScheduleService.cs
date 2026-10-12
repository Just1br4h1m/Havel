using AutoMapper;
using Havel.Application.Abstractions.Repositories;
using Havel.Application.Abstractions.Services;
using Havel.Application.Models.Medication;
using Havel.Domain.Entities;

namespace Havel.Infrastructure.Services;

public class MedicationScheduleService(IMapper mapper, IUserMedicationRepository userMedicationRepository)
    : IMedicationScheduleService
{
    public async Task<DetailsScheduleDto> ScheduleMedicationAsync(Guid userId,
        CreateScheduleDto medicationSchedule, CancellationToken cancellationToken)
    {
        UserMedicationEntity scheduleMedicationEntity =  mapper.Map<UserMedicationEntity>(medicationSchedule);
        scheduleMedicationEntity.UserId = userId;
        scheduleMedicationEntity.ScheduleId = Guid.NewGuid();
        await userMedicationRepository.CreateAsync(scheduleMedicationEntity, cancellationToken);
        
        DetailsScheduleDto schedule = mapper.Map<DetailsScheduleDto>(scheduleMedicationEntity);
        return schedule;
    }

    public async Task DeleteMedicationScheduleAsync(Guid scheduleId, CancellationToken cancellationToken)
    {
        UserMedicationEntity? scheduleMedicationEntity =
            await userMedicationRepository.RetrieveByScheduleIdAsync(scheduleId, cancellationToken);

        if (scheduleMedicationEntity == null)
            throw new ArgumentNullException();
        
        await userMedicationRepository.DeleteAsync(scheduleMedicationEntity, cancellationToken);
    }

    public async Task<ScheduleAggregate> RetrieveMedicationSchedulesAsync(Guid userId, CancellationToken cancellationToken)
    {
        TimeOnly morningStart = new TimeOnly(7, 0);
        TimeOnly afternoonStart = new TimeOnly(12, 0);
        TimeOnly eveningStart = new TimeOnly(18, 0);

        List<UserMedicationEntity> userScheduleMedicationsEntities 
            = await userMedicationRepository.RetrieveByUserIdAsync(userId, cancellationToken);
        
        List<DetailsScheduleDto> morningMedications = new List<DetailsScheduleDto>();
        List<DetailsScheduleDto> afternoonMedications = new List<DetailsScheduleDto>();
        List<DetailsScheduleDto> eveningMedications = new List<DetailsScheduleDto>();

        foreach (UserMedicationEntity medicationEntity in userScheduleMedicationsEntities)
        {
            if (medicationEntity?.DoseTimes == null || medicationEntity.DoseTimes.Length == 0)
                continue;

            bool addedToMorning = false;
            bool addedToAfternoon = false;
            bool addedToEvening = false;

            foreach (TimeOnly time in medicationEntity.DoseTimes)
            {
                if (time >= morningStart && time < afternoonStart)
                {
                    addedToMorning = true;
                }
                else if (time >= afternoonStart && time < eveningStart)
                {
                    addedToAfternoon = true;
                }
                else
                {
                    addedToEvening = true;
                }
            }

            if (addedToMorning)
                morningMedications.Add(mapper.Map<DetailsScheduleDto>(medicationEntity));

            if (addedToAfternoon)
                afternoonMedications.Add(mapper.Map<DetailsScheduleDto>(medicationEntity));

            if (addedToEvening)
                eveningMedications.Add(mapper.Map<DetailsScheduleDto>(medicationEntity));
        }

        return new ScheduleAggregate
        {
            MorningMedications = morningMedications.ToArray(),
            AfternoonMedications = afternoonMedications.ToArray(),
            EveningMedications = eveningMedications.ToArray()
        };
    }

    public async Task<DetailsScheduleDto> UpdateMedicationScheduleAsync(Guid scheduleId, CreateScheduleDto medicationSchedule,
        CancellationToken cancellationToken)
    {
        UserMedicationEntity? scheduleMedicationEntity =
            await userMedicationRepository.RetrieveByScheduleIdAsync(scheduleId, cancellationToken);
        
        if (scheduleMedicationEntity == null)
            throw new ArgumentNullException();
        
        if (scheduleId  != scheduleMedicationEntity.ScheduleId)
            throw new ArgumentException("ScheduleId mismatch");
        
        mapper.Map(medicationSchedule, scheduleMedicationEntity);
        await userMedicationRepository.UpdateAsync(scheduleMedicationEntity, cancellationToken);
        
        return mapper.Map<DetailsScheduleDto>(scheduleMedicationEntity);
    }
}