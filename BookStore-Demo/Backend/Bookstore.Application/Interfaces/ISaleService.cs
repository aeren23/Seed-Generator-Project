using Bookstore.Application.DTOs;

namespace Bookstore.Application.Interfaces;

public interface ISaleService
{
    Task<IEnumerable<SaleChartDataDto>> GetChartDataAsync(Guid? sellerId = null, CancellationToken cancellationToken = default);
}
