namespace Bookstore.Application.DTOs;

public class BookDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockCount { get; set; }
    public string CoverImageUrl { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string SellerName { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public Guid SellerId { get; set; }
}
