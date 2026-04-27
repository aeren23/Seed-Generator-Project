using Bookstore.Application.DTOs;

namespace Bookstore.Application.Interfaces;

public interface ICheckoutService
{
    Task ProcessCheckoutAsync(Guid userId, CancellationToken cancellationToken = default);
}
