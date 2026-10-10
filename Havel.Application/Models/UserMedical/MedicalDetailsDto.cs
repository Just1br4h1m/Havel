using Havel.Domain.Enums;

namespace Havel.Application.Models.UserMedical;

public record MedicalDetailsDto(
    Guid UserId,
    string PatientNumber,
    string HospitalNumber,
    BloodGroup BloodGroup,
    HaemoglobinGenotype Genotype,
    bool IsWheeled,
    bool IsPregnant
);
