using Bookstore.Application.DTOs;
using Bookstore.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bookstore.API.Controllers;

[Authorize(Roles = "Customer,Seller,Admin")]
[ApiController]
[Route("api/[controller]")]
public class BasketController : ControllerBase
{
    private readonly ICheckoutService _checkoutService;
    private readonly IBasketService _basketService;

    public BasketController(ICheckoutService checkoutService, IBasketService basketService)
    {
        _checkoutService = checkoutService;
        _basketService = basketService;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
            throw new UnauthorizedAccessException("Invalid user token.");
        return userId;
    }

    [HttpGet]
    public async Task<IActionResult> GetActiveBasket(CancellationToken cancellationToken)
    {
        try
        {
            var basket = await _basketService.GetActiveBasketAsync(GetUserId(), cancellationToken);
            return Ok(basket);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddToBasketDto dto, CancellationToken cancellationToken)
    {
        try
        {
            await _basketService.AddItemToBasketAsync(GetUserId(), dto, cancellationToken);
            return Ok(new { message = "Item added to basket." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("items/{bookId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid bookId, CancellationToken cancellationToken)
    {
        try
        {
            await _basketService.RemoveItemFromBasketAsync(GetUserId(), bookId, cancellationToken);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearBasket(CancellationToken cancellationToken)
    {
        try
        {
            await _basketService.ClearBasketAsync(GetUserId(), cancellationToken);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout(CancellationToken cancellationToken)
    {
        try
        {
            await _checkoutService.ProcessCheckoutAsync(GetUserId(), cancellationToken);
            return Ok(new { message = "Checkout completed successfully." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
