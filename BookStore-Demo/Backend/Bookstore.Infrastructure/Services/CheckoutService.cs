using Bookstore.Application.DTOs;
using Bookstore.Application.Interfaces;
using Bookstore.Domain.Entities;
using Bookstore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Bookstore.Infrastructure.Services;

public class CheckoutService : ICheckoutService
{
    private readonly AppDbContext _context;

    public CheckoutService(AppDbContext context)
    {
        _context = context;
    }

    public async Task ProcessCheckoutAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var basket = await _context.Baskets
            .Include(b => b.Items)
            .ThenInclude(i => i.Book)
            .FirstOrDefaultAsync(b => b.UserId == userId && !b.IsCompleted, cancellationToken);

        if (basket == null || !basket.Items.Any())
            throw new InvalidOperationException("Basket is empty or not found.");

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var sale = new Sale
            {
                Id = Guid.NewGuid(),
                CustomerId = userId,
                SaleDate = DateTime.UtcNow,
                TotalAmount = 0
            };

            decimal totalAmount = 0;

            foreach (var item in basket.Items)
            {
                var book = item.Book;

                if (book.StockCount < item.Quantity)
                    throw new InvalidOperationException($"Insufficient stock for '{book.Title}'. Available: {book.StockCount}, Requested: {item.Quantity}");

                // Reduce stock
                book.StockCount -= item.Quantity;

                // Create SaleItem with SellerId for per-seller analytics
                var saleItem = new SaleItem
                {
                    Id = Guid.NewGuid(),
                    SaleId = sale.Id,
                    BookId = book.Id,
                    SellerId = book.SellerId,
                    UnitPrice = book.Price,
                    Quantity = item.Quantity
                };

                sale.Items.Add(saleItem);
                totalAmount += book.Price * item.Quantity;
            }

            sale.TotalAmount = totalAmount;

            _context.Sales.Add(sale);
            basket.IsCompleted = true; // Mark basket as checked out

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
