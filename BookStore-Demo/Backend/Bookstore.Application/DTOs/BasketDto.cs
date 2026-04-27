namespace Bookstore.Application.DTOs;

public class BasketDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public decimal TotalAmount { get; set; }
    public List<BasketItemDto> Items { get; set; } = new();
}

public class BasketItemDto
{
    public Guid BookId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal SubTotal => UnitPrice * Quantity;
}

public class AddToBasketDto
{
    public Guid BookId { get; set; }
    public int Quantity { get; set; }
}
