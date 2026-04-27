using Bookstore.Application.DTOs;

namespace Bookstore.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto request);
    Task<AuthResponseDto> RegisterAsync(RegisterDto request);
}
