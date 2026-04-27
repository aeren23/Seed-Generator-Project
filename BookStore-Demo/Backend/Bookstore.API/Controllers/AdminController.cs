using Bookstore.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bookstore.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IOmniSeedService _omniSeedService;

    public AdminController(IOmniSeedService omniSeedService)
    {
        _omniSeedService = omniSeedService;
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
}
