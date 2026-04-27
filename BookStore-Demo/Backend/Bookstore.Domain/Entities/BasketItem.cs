namespace Bookstore.Domain.Entities;

public class BasketItem
{
    public Guid Id { get; set; }
    public Guid BasketId { get; set; }
    public Guid BookId { get; set; }
    public int Quantity { get; set; }

    // Navigation Properties
    public Basket Basket { get; set; } = null!;
    public Book Book { get; set; } = null!;
}
