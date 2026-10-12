using Havel.Domain.Enums;

namespace Havel.Application.Models.Medication;

public record CreateScheduleDto(
    string? medicationName,
    string? medicationDescription,
    FoodTiming foodTiming,
    TimeOnly[] doseTimes,
    bool IsPill,
    bool isSyrup,
    decimal quantityAmountPills,
    decimal quantityAmountSyrups,
    string? notes
);