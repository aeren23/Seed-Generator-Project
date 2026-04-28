using Bookstore.Application.DTOs;
using Bookstore.Application.Interfaces;
using Bookstore.Domain.Entities;
using Bookstore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Bookstore.Infrastructure.Repositories;

public class SaleRepository : ISaleRepository
{
    private readonly AppDbContext _context;

    public SaleRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Sale> AddAsync(Sale sale, CancellationToken cancellationToken = default)
    {
        _context.Sales.Add(sale);
        await _context.SaveChangesAsync(cancellationToken);
        return sale;
    }

    public async Task<IEnumerable<SaleChartDataDto>> GetChartDataAsync(Guid? sellerId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Sales
            .Include(s => s.Items)
            .AsNoTracking()
            .AsQueryable();

        return await query
            .SelectMany(s => s.Items)
            .Where(si => !sellerId.HasValue || si.SellerId == sellerId.Value)
            .GroupBy(si => si.Sale.SaleDate.Date)
            .Select(g => new SaleChartDataDto
            {
                Date = g.Key,
                TotalRevenue = g.Sum(si => si.UnitPrice * si.Quantity),
                TotalItems = g.Sum(si => si.Quantity)
            })
            .OrderBy(d => d.Date)
            .ToListAsync(cancellationToken);
    }
}
