using Bookstore.Application.Interfaces;
using Bookstore.Domain.Entities;
using Bookstore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Bookstore.Infrastructure.Repositories;

public class BookRepository : IBookRepository
{
    private readonly AppDbContext _context;

    public BookRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Book>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Books
            .Include(b => b.Category)
            .Include(b => b.Seller)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<Book> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.Books
            .Include(b => b.Category)
            .Include(b => b.Seller)
            .AsNoTracking();

        var totalCount = await query.CountAsync(cancellationToken);
        
        var items = await query
            .OrderBy(b => b.Title)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Book?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Books
            .Include(b => b.Category)
            .Include(b => b.Seller)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    public async Task<Book> AddAsync(Book book, CancellationToken cancellationToken = default)
    {
        _context.Books.Add(book);
        await _context.SaveChangesAsync(cancellationToken);
        
        // Reload with navigation properties
        await _context.Entry(book).Reference(b => b.Category).LoadAsync(cancellationToken);
        await _context.Entry(book).Reference(b => b.Seller).LoadAsync(cancellationToken);
        
        return book;
    }

    public async Task UpdateAsync(Book book, CancellationToken cancellationToken = default)
    {
        _context.Books.Update(book);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var book = await _context.Books.FindAsync(new object[] { id }, cancellationToken)
            ?? throw new KeyNotFoundException($"Book with id '{id}' not found.");

        _context.Books.Remove(book);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
