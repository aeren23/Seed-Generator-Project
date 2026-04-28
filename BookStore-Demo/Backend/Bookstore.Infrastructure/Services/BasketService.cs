using Bookstore.Application.DTOs;
using Bookstore.Application.Interfaces;
using Bookstore.Domain.Entities;
using Bookstore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Bookstore.Infrastructure.Services;

public class BasketService : IBasketService
{
    private readonly AppDbContext _context;

    public BasketService(AppDbContext context)
    {
        _context = context;
    }

    private async Task<Basket> GetOrCreateActiveBasketEntityAsync(Guid userId, CancellationToken cancellationToken)
    {
        var basket = await _context.Baskets
            .Include(b => b.Items)
            .ThenInclude(i => i.Book)
            .FirstOrDefaultAsync(b => b.UserId == userId && !b.IsCompleted, cancellationToken);

        if (basket == null)
        {
            basket = new Basket
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                IsCompleted = false
            };
            _context.Baskets.Add(basket);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return basket;
    }

    public async Task<BasketDto> GetActiveBasketAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var basket = await GetOrCreateActiveBasketEntityAsync(userId, cancellationToken);

        return new BasketDto
        {
            Id = basket.Id,
            UserId = basket.UserId,
            TotalAmount = basket.Items.Sum(i => i.Quantity * i.Book.Price),
            Items = basket.Items.Select(i => new BasketItemDto
            {
                BookId = i.BookId,
                BookTitle = i.Book.Title,
                CoverImageUrl = i.Book.CoverImageUrl,
                UnitPrice = i.Book.Price,
                Quantity = i.Quantity
            }).ToList()
        };
    }

    public async Task AddItemToBasketAsync(Guid userId, AddToBasketDto dto, CancellationToken cancellationToken = default)
    {
        var basket = await GetOrCreateActiveBasketEntityAsync(userId, cancellationToken);

        var book = await _context.Books.FindAsync(new object[] { dto.BookId }, cancellationToken)
            ?? throw new KeyNotFoundException($"Book with id '{dto.BookId}' not found.");

        if (book.StockCount < dto.Quantity)
            throw new InvalidOperationException($"Insufficient stock for '{book.Title}'. Available: {book.StockCount}");

        var existingItem = basket.Items.FirstOrDefault(i => i.BookId == dto.BookId);

        if (existingItem != null)
        {
            if (book.StockCount < existingItem.Quantity + dto.Quantity)
                throw new InvalidOperationException($"Insufficient stock to add more of '{book.Title}'.");

            existingItem.Quantity += dto.Quantity;
        }
        else
        {
            // Use _context.BasketItems.Add() directly to guarantee EntityState.Added.
            // basket.Items.Add() mis-tracks state as Modified on a previously saved basket,
            // causing EF to generate UPDATE instead of INSERT => DbUpdateConcurrencyException.
            var newItem = new BasketItem
            {
                Id = Guid.NewGuid(),
                BasketId = basket.Id,
                BookId = dto.BookId,
                Quantity = dto.Quantity
            };
            _context.BasketItems.Add(newItem);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveItemFromBasketAsync(Guid userId, Guid bookId, CancellationToken cancellationToken = default)
    {
        var basket = await GetOrCreateActiveBasketEntityAsync(userId, cancellationToken);

        var item = basket.Items.FirstOrDefault(i => i.BookId == bookId);
        if (item != null)
        {
            _context.BasketItems.Remove(item);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task ClearBasketAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var basket = await GetOrCreateActiveBasketEntityAsync(userId, cancellationToken);

        _context.BasketItems.RemoveRange(basket.Items);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
