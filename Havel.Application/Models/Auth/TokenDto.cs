namespace Havel.Application.Models.Auth;

public class TokenDto
{
    public string AccessToken { get; set; }
    public string RefreshToken { get; set; }
}