using Bookstore.Application.DTOs;
using Bookstore.Application.Interfaces;
using Bookstore.Domain.Entities;

namespace Bookstore.Infrastructure.Services;

public class BookService : IBookService
{
    private readonly IBookRepository _bookRepository;

    public BookService(IBookRepository bookRepository)
    {
        _bookRepository = bookRepository;
    }

    public async Task<IEnumerable<BookDto>> GetAllBooksAsync(CancellationToken cancellationToken = default)
    {
        var books = await _bookRepository.GetAllAsync(cancellationToken);

        return books.Select(b => new BookDto
        {
            Id = b.Id,
            Title = b.Title,
            AuthorName = b.AuthorName,
            Price = b.Price,
            StockCount = b.StockCount,
            CoverImageUrl = b.CoverImageUrl,
            CategoryName = b.Category.Name,
            SellerName = b.Seller.FullName,
            CategoryId = b.CategoryId,
            SellerId = b.SellerId
        });
    }

    public async Task<PagedResult<BookDto>> GetPagedBooksAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await _bookRepository.GetPagedAsync(pageNumber, pageSize, cancellationToken);

        var dtos = items.Select(b => new BookDto
        {
            Id = b.Id,
            Title = b.Title,
            AuthorName = b.AuthorName,
            Price = b.Price,
            StockCount = b.StockCount,
            CoverImageUrl = b.CoverImageUrl,
            CategoryName = b.Category?.Name ?? "Unknown",
            SellerName = b.Seller?.FullName ?? "Unknown",
            CategoryId = b.CategoryId,
            SellerId = b.SellerId
        });

        return new PagedResult<BookDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<BookDto?> GetBookByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var book = await _bookRepository.GetByIdAsync(id, cancellationToken);
        if (book == null) return null;

        return new BookDto
        {
            Id = book.Id,
            Title = book.Title,
            AuthorName = book.AuthorName,
            Price = book.Price,
            StockCount = book.StockCount,
            CoverImageUrl = book.CoverImageUrl,
            CategoryName = book.Category?.Name ?? "Unknown",
            SellerName = book.Seller?.FullName ?? "Unknown",
            CategoryId = book.CategoryId,
            SellerId = book.SellerId
        };
    }

    public async Task<BookDto> CreateBookAsync(CreateBookDto dto, CancellationToken cancellationToken = default)
    {
        var book = new Book
        {
            Id = Guid.NewGuid(),
            SellerId = dto.SellerId,
            CategoryId = dto.CategoryId,
            Title = dto.Title,
            AuthorName = dto.AuthorName,
            Price = dto.Price,
            StockCount = dto.StockCount,
            CoverImageUrl = dto.CoverImageUrl
        };

        var created = await _bookRepository.AddAsync(book, cancellationToken);

        return new BookDto
        {
            Id = created.Id,
            Title = created.Title,
            AuthorName = created.AuthorName,
            Price = created.Price,
            StockCount = created.StockCount,
            CoverImageUrl = created.CoverImageUrl,
            CategoryName = created.Category.Name,
            SellerName = created.Seller.FullName,
            CategoryId = created.CategoryId,
            SellerId = created.SellerId
        };
    }

    public async Task UpdateBookAsync(Guid id, Guid sellerId, CreateBookDto dto, CancellationToken cancellationToken = default)
    {
        var book = await _bookRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"Book with id '{id}' not found.");

        if (book.SellerId != sellerId)
            throw new UnauthorizedAccessException("You are not authorized to update this book.");

        book.Title = dto.Title;
        book.AuthorName = dto.AuthorName;
        book.CategoryId = dto.CategoryId;
        book.Price = dto.Price;
        book.StockCount = dto.StockCount;
        book.CoverImageUrl = dto.CoverImageUrl;

        await _bookRepository.UpdateAsync(book, cancellationToken);
    }

    public async Task DeleteBookAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _bookRepository.DeleteAsync(id, cancellationToken);
    }
}
