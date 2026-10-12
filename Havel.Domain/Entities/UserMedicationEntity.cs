using System.ComponentModel.DataAnnotations;
using Havel.Domain.Enums;

namespace Havel.Domain.Entities;

public class UserMedicationEntity
{
    public Guid UserId { get; set; }
    [Key]
    public Guid? ScheduleId { get; set; }
    public string? MedicationName { get; set; }
    public string? MedicationDescription { get; set; }
    public FoodTiming FoodTiming { get; set; }
    public TimeOnly[] DoseTimes { get; set; }
    public bool IsPill { get; set; }
    public bool IsSyrup { get; set; }
    public decimal QuantityAmountPills { get; set; }
    public decimal QuantityAmountSyrups { get; set; }
    public string? Notes { get; set; }
    
    
    public UserEntity? User { get; set; }
}