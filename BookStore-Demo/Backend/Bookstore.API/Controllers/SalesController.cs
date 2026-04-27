using Bookstore.Application.DTOs;
using Bookstore.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bookstore.API.Controllers;

[Authorize(Roles = "Seller,Admin")]
[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly ISaleService _saleService;

    public SalesController(ISaleService saleService)
    {
        _saleService = saleService;
    }

    /// <summary>
    /// Satışları tarihe göre gruplayarak grafik verisi döner (Seller Dashboard için).
    /// </summary>
    [HttpGet("chart-data")]
    public async Task<ActionResult<IEnumerable<SaleChartDataDto>>> GetChartData(CancellationToken cancellationToken)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        Guid? sellerId = null;
        if (role == "Seller" && Guid.TryParse(userIdString, out var parsedId))
        {
            sellerId = parsedId;
        }
        
        var data = await _saleService.GetChartDataAsync(sellerId, cancellationToken);
        return Ok(data);
    }
}
