using Bookstore.Domain.Entities;

namespace Bookstore.Application.Interfaces;

public interface IBookRepository
{
    Task<IEnumerable<Book>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<(IEnumerable<Book> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<Book?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Book> AddAsync(Book book, CancellationToken cancellationToken = default);
    Task UpdateAsync(Book book, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
