using Bookstore.Application.DTOs;
using Bookstore.Application.Interfaces;
using Bookstore.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bookstore.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IOmniSeedService _omniSeedService;
    private readonly UserManager<User> _userManager;

    public AdminController(IOmniSeedService omniSeedService, UserManager<User> userManager)
    {
        _omniSeedService = omniSeedService;
        _userManager = userManager;
    }

    /// <summary>
    /// Sistemi Golden State'e döndürmek için OmniSeed CLI'ı tetikler.
    /// </summary>
    [HttpPost("reset")]
    public async Task<IActionResult> ResetDemoState(CancellationToken cancellationToken)
    {
        try
        {
            var success = await _omniSeedService.TriggerResetAsync(cancellationToken);
            if (success)
            {
                return Ok(new { message = "Sistem başarıyla Golden State'e döndürüldü." });
            }
            return StatusCode(500, new { error = "OmniSeed CLI tetiklenirken hata oluştu veya başarısız kod döndü." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Tüm kullanıcıları rolleriyle birlikte listeler.
    /// </summary>
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userManager.Users.ToListAsync();
        var result = new List<UserListDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            result.Add(new UserListDto
            {
                Id = user.Id.ToString(),
                UserName = user.UserName ?? "",
                Email = user.Email ?? "",
                FullName = user.FullName,
                Role = roles.FirstOrDefault() ?? "Customer"
            });
        }

        return Ok(result);
    }

    /// <summary>
    /// Bir kullanıcının rolünü değiştirir.
    /// </summary>
    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> ChangeUserRole(string id, [FromBody] ChangeRoleDto dto)
    {
        var validRoles = new[] { "Admin", "Seller", "Customer" };
        if (!validRoles.Contains(dto.NewRole))
            return BadRequest(new { message = $"Geçersiz rol: {dto.NewRole}. Geçerli roller: Admin, Seller, Customer" });

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound(new { message = "Kullanıcı bulunamadı." });

        // Remove all current roles
        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);

        // Add new role
        var result = await _userManager.AddToRoleAsync(user, dto.NewRole);
        if (!result.Succeeded)
            return StatusCode(500, new { message = "Rol atanırken hata oluştu." });

        return Ok(new { message = $"Kullanıcı rolü '{dto.NewRole}' olarak güncellendi." });
    }

    /// <summary>
    /// Bir kullanıcıyı siler.
    /// </summary>
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound(new { message = "Kullanıcı bulunamadı." });

        // Prevent self-deletion
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (user.Id.ToString() == currentUserId)
            return BadRequest(new { message = "Kendinizi silemezsiniz." });

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return StatusCode(500, new { message = "Kullanıcı silinirken hata oluştu." });

        return Ok(new { message = "Kullanıcı başarıyla silindi." });
    }

    /// <summary>
    /// Yeni kullanıcı oluşturur ve rol atar.
    /// </summary>
    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        var validRoles = new[] { "Admin", "Seller", "Customer" };
        if (!validRoles.Contains(dto.Role))
            return BadRequest(new { message = $"Geçersiz rol: {dto.Role}" });

        var existingUser = await _userManager.FindByNameAsync(dto.UserName);
        if (existingUser != null)
            return BadRequest(new { message = "Bu kullanıcı adı zaten kullanılıyor." });

        var user = new User
        {
            UserName = dto.UserName,
            Email = dto.Email,
            FullName = dto.FullName
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new { message = $"Kullanıcı oluşturulamadı: {errors}" });
        }

        await _userManager.AddToRoleAsync(user, dto.Role);

        return Ok(new UserListDto
        {
            Id = user.Id.ToString(),
            UserName = user.UserName,
            Email = user.Email ?? "",
            FullName = user.FullName,
            Role = dto.Role
        });
    }
}
