using Bookstore.Application.Interfaces;
using Bookstore.Domain.Entities;
using Bookstore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Bookstore.Infrastructure.Repositories;

public class BasketRepository : IBasketRepository
{
    private readonly AppDbContext _context;

    public BasketRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Basket?> GetActiveBasketAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Baskets
            .Include(b => b.Items)
                .ThenInclude(bi => bi.Book)
            .FirstOrDefaultAsync(b => b.UserId == userId && !b.IsCompleted, cancellationToken);
    }

    public async Task<Basket> AddAsync(Basket basket, CancellationToken cancellationToken = default)
    {
        _context.Baskets.Add(basket);
        await _context.SaveChangesAsync(cancellationToken);
        return basket;
    }

    public async Task UpdateAsync(Basket basket, CancellationToken cancellationToken = default)
    {
        _context.Baskets.Update(basket);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
