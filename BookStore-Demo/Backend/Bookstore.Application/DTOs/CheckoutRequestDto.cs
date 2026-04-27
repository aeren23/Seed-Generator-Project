namespace Bookstore.Application.DTOs;

public class CheckoutRequestDto
{
    public List<CheckoutItemDto> Items { get; set; } = new();
}

public class CheckoutItemDto
{
    public Guid BookId { get; set; }
    public int Quantity { get; set; }
}
