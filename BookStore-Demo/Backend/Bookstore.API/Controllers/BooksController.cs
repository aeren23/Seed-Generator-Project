using Bookstore.Application.DTOs;
using Bookstore.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bookstore.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IBookService _bookService;

    public BooksController(IBookService bookService)
    {
        _bookService = bookService;
    }

    /// <summary>
    /// Tüm kitapları kategori ve stok bilgisiyle sayfalı olarak listeler.
    /// </summary>
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<PagedResult<BookDto>>> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var result = await _bookService.GetPagedBooksAsync(pageNumber, pageSize, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir kitabın detaylarını getirir.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BookDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var book = await _bookService.GetBookByIdAsync(id, cancellationToken);
        if (book == null) return NotFound();
        return Ok(book);
    }

    /// <summary>
    /// Yeni kitap ekler (Satıcı tarafından çöp veri ekleme testi için).
    /// </summary>
    [Authorize(Roles = "Seller,Admin")]
    [HttpPost]
    public async Task<ActionResult<BookDto>> Create([FromBody] CreateBookDto dto, CancellationToken cancellationToken)
    {
        var book = await _bookService.CreateBookAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetAll), new { id = book.Id }, book);
    }

    /// <summary>
    /// Kitap bilgilerini günceller. Sadece kitabın sahibi olan satıcı silebilir.
    /// </summary>
    [Authorize(Roles = "Seller,Admin")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateBookDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out var sellerId))
                return Unauthorized(new { message = "Invalid user token." });

            await _bookService.UpdateBookAsync(id, sellerId, dto, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    /// <summary>
    /// Kitap siler (Satıcının sistemi bozma testi için).
    /// </summary>
    [Authorize(Roles = "Seller,Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await _bookService.DeleteBookAsync(id, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
