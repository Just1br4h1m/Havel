namespace Havel.Application.Models.Medication;

public class ScheduleAggregate
{
    public DetailsScheduleDto[] MorningMedications { get; set; }
    public DetailsScheduleDto[] AfternoonMedications  { get; set; }
    public DetailsScheduleDto[] EveningMedications { get; set; }
}
