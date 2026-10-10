using Havel.Domain.Enums;

namespace Havel.Application.Models;

public class UpdateUserDto
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public Gender Gender { get; set; }
    public string Telephone { get; set; }
    public DateOnly DateOfBirth { get; set; }
}
