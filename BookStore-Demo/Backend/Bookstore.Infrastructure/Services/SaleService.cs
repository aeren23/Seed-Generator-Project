using Bookstore.Application.DTOs;
using Bookstore.Application.Interfaces;

namespace Bookstore.Infrastructure.Services;

public class SaleService : ISaleService
{
    private readonly ISaleRepository _saleRepository;

    public SaleService(ISaleRepository saleRepository)
    {
        _saleRepository = saleRepository;
    }

    public async Task<IEnumerable<SaleChartDataDto>> GetChartDataAsync(Guid? sellerId = null, CancellationToken cancellationToken = default)
    {
        return await _saleRepository.GetChartDataAsync(sellerId, cancellationToken);
    }
}
