using Havel.Application.Abstractions.Services;
using Havel.Application.Models.Medication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Havel.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ScheduleController: ControllerBase
{
    private readonly IMedicationScheduleService  _medicationScheduleService;

    public ScheduleController(IMedicationScheduleService medicationScheduleService)
    {
        _medicationScheduleService = medicationScheduleService;
    }

    [HttpPost("schedule-medication")]
    public async Task<ActionResult<DetailsScheduleDto>> CreateMedicationSchedule(
        [FromHeader] Guid userId,
        CreateScheduleDto medicationSchedule,
        CancellationToken cancellationToken)
    {
        DetailsScheduleDto result =
            await _medicationScheduleService.ScheduleMedicationAsync(userId, medicationSchedule, cancellationToken);
        
        return Ok(result);
    }

    [HttpDelete("remove-schedule-medication")]
    public async Task<ActionResult> RemoveMedicationSchedule(
        [FromHeader] Guid scheduleId,
        CancellationToken cancellationToken)
    {
        await _medicationScheduleService.DeleteMedicationScheduleAsync(scheduleId, cancellationToken);
        return NoContent();
    }

    [HttpGet("get-schedule")]
    public async Task<ActionResult<ScheduleAggregate>> GetSchedule(
        [FromHeader] Guid userId, 
        CancellationToken cancellationToken)
    {
        ScheduleAggregate result =
            await _medicationScheduleService.RetrieveMedicationSchedulesAsync(userId, cancellationToken);
        
        return Ok(result);
    }

    [HttpPut("update-schedule")]
    public async Task<ActionResult<DetailsScheduleDto>> UpdateMedicationScheduleAsync(
        [FromHeader] Guid scheduleId,
        CreateScheduleDto medicationSchedule,
        CancellationToken cancellationToken)
    {
        DetailsScheduleDto result =
            await _medicationScheduleService.UpdateMedicationScheduleAsync(scheduleId, medicationSchedule,
                cancellationToken);
        
        return Ok(result);
    }
    
    
}