namespace Bookstore.Domain.Entities;

public class Basket
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public bool IsCompleted { get; set; }

    // Navigation Properties
    public User User { get; set; } = null!;
    public ICollection<BasketItem> Items { get; set; } = new List<BasketItem>();
}
