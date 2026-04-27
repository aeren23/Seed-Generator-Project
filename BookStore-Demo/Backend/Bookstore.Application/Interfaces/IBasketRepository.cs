using Bookstore.Domain.Entities;

namespace Bookstore.Application.Interfaces;

public interface IBasketRepository
{
    Task<Basket?> GetActiveBasketAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Basket> AddAsync(Basket basket, CancellationToken cancellationToken = default);
    Task UpdateAsync(Basket basket, CancellationToken cancellationToken = default);
}
