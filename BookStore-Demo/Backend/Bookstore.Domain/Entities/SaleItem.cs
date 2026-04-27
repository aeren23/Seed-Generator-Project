namespace Bookstore.Domain.Entities;

public class SaleItem
{
    public Guid Id { get; set; }
    public Guid SaleId { get; set; }
    public Guid BookId { get; set; }
    public Guid SellerId { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }

    // Navigation Properties
    public Sale Sale { get; set; } = null!;
    public Book Book { get; set; } = null!;
    public User Seller { get; set; } = null!;
}
