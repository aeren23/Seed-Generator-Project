namespace Bookstore.Application.DTOs;

public class SaleChartDataDto
{
    public DateTime Date { get; set; }
    public decimal TotalRevenue { get; set; }
    public int TotalItems { get; set; }
}
