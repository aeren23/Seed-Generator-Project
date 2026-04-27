using Bookstore.Application.DTOs;

namespace Bookstore.Application.Interfaces;

public interface IBasketService
{
    Task<BasketDto> GetActiveBasketAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddItemToBasketAsync(Guid userId, AddToBasketDto dto, CancellationToken cancellationToken = default);
    Task RemoveItemFromBasketAsync(Guid userId, Guid bookId, CancellationToken cancellationToken = default);
    Task ClearBasketAsync(Guid userId, CancellationToken cancellationToken = default);
}
