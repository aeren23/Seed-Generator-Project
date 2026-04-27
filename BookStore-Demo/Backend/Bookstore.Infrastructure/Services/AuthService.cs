using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Bookstore.Application.DTOs;
using Bookstore.Application.Interfaces;
using Bookstore.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Bookstore.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly IConfiguration _configuration;

    public AuthService(UserManager<User> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto request)
    {
        var user = await _userManager.FindByNameAsync(request.Username);
        if (user == null)
            throw new Exception("Invalid credentials");

        var result = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!result)
            throw new Exception("Invalid credentials");

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "Customer";

        var token = GenerateJwtToken(user, role);

        return new AuthResponseDto
        {
            UserId = user.Id,
            Token = token,
            Username = user.UserName!,
            FullName = user.FullName,
            Role = role
        };
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto request)
    {
        var userExists = await _userManager.FindByNameAsync(request.Email);
        if (userExists != null)
            throw new Exception("User already exists");

        var user = new User
        {
            UserName = request.Email, // Email as username
            Email = request.Email,
            FullName = request.FullName
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            throw new Exception("Failed to create user: " + string.Join(", ", result.Errors.Select(e => e.Description)));

        var validRoles = new[] { "Admin", "Seller", "Customer" };
        var roleToAssign = validRoles.Contains(request.Role) ? request.Role : "Customer";
        
        await _userManager.AddToRoleAsync(user, roleToAssign);

        var token = GenerateJwtToken(user, roleToAssign);

        return new AuthResponseDto
        {
            UserId = user.Id,
            Token = token,
            Username = user.UserName,
            FullName = user.FullName,
            Role = roleToAssign
        };
    }

    private string GenerateJwtToken(User user, string role)
    {
        var authClaims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.UserName!),
            new Claim(ClaimTypes.Role, role),
            new Claim("FullName", user.FullName)
        };

        var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            expires: DateTime.Now.AddMinutes(double.Parse(_configuration["Jwt:ExpireMinutes"]!)),
            claims: authClaims,
            signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
