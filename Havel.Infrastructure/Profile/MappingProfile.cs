using Havel.Application.Models;
using Havel.Application.Models.Medication;
using Havel.Application.Models.UserMedical;
using Havel.Domain.Entities;

namespace Havel.Infrastructure.Profile;

public class MappingProfile: AutoMapper.Profile
{
    public MappingProfile()
    {
        CreateMap<UserEntity, UserDto>();
        CreateMap<UpdateUserDto, UserEntity>();
        CreateMap<UserMedicalInformationEntity, MedicalDto>().ReverseMap();
        CreateMap<UserMedicalInformationEntity, MedicalDetailsDto>();

        CreateMap<UserMedicationEntity, CreateScheduleDto>().ReverseMap();
        CreateMap<UserMedicationEntity, DetailsScheduleDto>();
    }
}