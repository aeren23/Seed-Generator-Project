using Bookstore.Application.DTOs;

namespace Bookstore.Application.Interfaces;

public interface IBookService
{
    Task<IEnumerable<BookDto>> GetAllBooksAsync(CancellationToken cancellationToken = default);
    Task<PagedResult<BookDto>> GetPagedBooksAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<BookDto?> GetBookByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<BookDto> CreateBookAsync(CreateBookDto dto, CancellationToken cancellationToken = default);
    Task UpdateBookAsync(Guid id, Guid sellerId, CreateBookDto dto, CancellationToken cancellationToken = default);
    Task DeleteBookAsync(Guid id, CancellationToken cancellationToken = default);
}
