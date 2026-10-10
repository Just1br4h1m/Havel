using Havel.Domain.Enums;

namespace Havel.Application.Models.UserMedical;

public record MedicalDto( 
    string PatientNumber,
    string HospitalNumber,
    BloodGroup BloodGroup,
    HaemoglobinGenotype Genotype,
    bool IsWheeled,
    bool IsPregnant
);