namespace Bookstore.Domain.Entities;

public class Book
{
    public Guid Id { get; set; }
    public Guid SellerId { get; set; }
    public Guid CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockCount { get; set; }
    public string CoverImageUrl { get; set; } = string.Empty;

    // Navigation Properties
    public User Seller { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
