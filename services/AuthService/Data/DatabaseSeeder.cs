using Microsoft.AspNetCore.Identity;

namespace JobTrackAI.AuthService.Data
{
    public class DatabaseSeeder
    {
        public static async Task SeedAsync(UserManager<IdentityUser> userManager, ApplicationDbContext context)
        {
            try
            {
                // Apply pending migrations
                context.Database.EnsureCreated();

                // Check if dummy user already exists
                var existingUser = await userManager.FindByEmailAsync("test@example.com");
                if (existingUser != null)
                {
                    Console.WriteLine("✓ Dummy user already exists");
                    return;
                }

                // Create dummy user
                var dummyUser = new IdentityUser
                {
                    UserName = "test@example.com",
                    Email = "test@example.com",
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(dummyUser, "Test@123");
                if (result.Succeeded)
                {
                    Console.WriteLine("✓ Dummy user created successfully");
                    Console.WriteLine("  Email: test@example.com");
                    Console.WriteLine("  Password: Test@123");
                }
                else
                {
                    Console.WriteLine("✗ Failed to create dummy user:");
                    foreach (var error in result.Errors)
                    {
                        Console.WriteLine($"  - {error.Description}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Error seeding database: {ex.Message}");
            }
        }
    }
}
