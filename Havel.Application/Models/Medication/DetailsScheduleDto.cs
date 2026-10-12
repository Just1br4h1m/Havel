using Havel.Domain.Enums;

namespace Havel.Application.Models.Medication;

public record DetailsScheduleDto(
    Guid userId,
    Guid scheduleId,
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