using System.ComponentModel.DataAnnotations;
using Havel.Domain.Enums;

namespace Havel.Domain.Entities;

public class UserMedicalInformationEntity
{
    [Key]
    public Guid UserId { get; set; }
    public string? PatientNumber { get; set; }
    public string? HospitalNumber { get; set; }
    public BloodGroup BloodGroup { get; set; }
    public HaemoglobinGenotype Genotype { get; set; }
    public bool IsWheeled { get; set; }
    public bool IsPregnant {  get; set; }
    
    public UserEntity? User { get; set; }
}