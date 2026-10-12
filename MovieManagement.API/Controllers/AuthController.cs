using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MovieManagement.API.Data;
using MovieManagement.API.Models;
using System.Security.Cryptography;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace MovieManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly MovieDbContext _context;
    public AuthController(MovieDbContext context) => _context = context;

    private static readonly PasswordHasher<User> PasswordHasher = new();

    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes).ToLower();
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var username = dto.Username?.Trim() ?? string.Empty;
        var email = dto.Email?.Trim().ToLowerInvariant() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Username, email and password are required." });
        if (username.Length is < 3 or > 30)
            return BadRequest(new { message = "Username must contain 3–30 characters." });
        if (!new EmailAddressAttribute().IsValid(email))
            return BadRequest(new { message = "Enter a valid email address." });
        if (dto.Password.Length is < 8 or > 128)
            return BadRequest(new { message = "Password must contain 8–128 characters." });

        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == email))
            return Conflict(new { message = "Email already registered." });

        if (await _context.Users.AnyAsync(u => u.Username.ToLower() == username.ToLower()))
            return Conflict(new { message = "Username already taken." });

        var user = new User
        {
            Username = username,
            Email = email,
            CountryID = 1,
            RegistrationDate = DateTime.UtcNow
        };
        user.PasswordHash = PasswordHasher.HashPassword(user, dto.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { userID = user.UserID, username = user.Username, email = user.Email });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Email and password are required." });

        var email = dto.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);
        if (user == null)
            return Unauthorized(new { message = "Invalid email or password." });

        var verified = false;
        var needsRehash = false;
        if (string.IsNullOrEmpty(user.PasswordHash))
            return Unauthorized(new { message = "This account has no password. Register a new account." });

        if (user.PasswordHash.Length == 64 && user.PasswordHash.All(Uri.IsHexDigit))
        {
            var legacyHash = HashPassword(dto.Password);
            verified = CryptographicOperations.FixedTimeEquals(
                Encoding.ASCII.GetBytes(user.PasswordHash), Encoding.ASCII.GetBytes(legacyHash));
            needsRehash = verified;
        }
        else
        {
            var result = PasswordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            verified = result != PasswordVerificationResult.Failed;
            needsRehash = result == PasswordVerificationResult.SuccessRehashNeeded;
        }

        if (!verified)
            return Unauthorized(new { message = "Invalid email or password." });

        if (needsRehash)
        {
            user.PasswordHash = PasswordHasher.HashPassword(user, dto.Password);
            await _context.SaveChangesAsync();
        }

        return Ok(new { userID = user.UserID, username = user.Username, email = user.Email });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Select(u => new { u.UserID, u.Username, u.Email, u.RegistrationDate,
                               ReviewCount = u.Reviews.Count })
            .OrderByDescending(u => u.RegistrationDate)
            .ToListAsync();
        return Ok(users);
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public record RegisterDto(string Username, string Email, string Password);
public record LoginDto(string Email, string Password);
