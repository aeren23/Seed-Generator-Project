namespace Bookstore.Application.DTOs;

public class CreateBookDto
{
    public Guid SellerId { get; set; }
    public Guid CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockCount { get; set; }
    public string CoverImageUrl { get; set; } = string.Empty;
}
