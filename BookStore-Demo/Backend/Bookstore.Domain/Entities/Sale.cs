namespace Bookstore.Domain.Entities;

public class Sale
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime SaleDate { get; set; }

    // Navigation Properties
    public User Customer { get; set; } = null!;
    public ICollection<SaleItem> Items { get; set; } = new List<SaleItem>();
}
