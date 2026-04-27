using Bookstore.Application.DTOs;
using Bookstore.Domain.Entities;

namespace Bookstore.Application.Interfaces;

public interface ISaleRepository
{
    Task<Sale> AddAsync(Sale sale, CancellationToken cancellationToken = default);
    Task<IEnumerable<SaleChartDataDto>> GetChartDataAsync(Guid? sellerId = null, CancellationToken cancellationToken = default);
}
