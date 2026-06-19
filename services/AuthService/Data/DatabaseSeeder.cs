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

                // Seed test@example.com
                var existingUser = await userManager.FindByEmailAsync("test@example.com");
                if (existingUser == null)
                {
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
                else
                {
                    Console.WriteLine("✓ Dummy user already exists");
                }

                // Seed vikas@gmail.com
                var vikasUser = await userManager.FindByEmailAsync("vikas@gmail.com");
                if (vikasUser == null)
                {
                    var dummyUser = new IdentityUser
                    {
                        UserName = "vikas@gmail.com",
                        Email = "vikas@gmail.com",
                        EmailConfirmed = true
                    };

                    var result = await userManager.CreateAsync(dummyUser, "Vikas123");
                    if (result.Succeeded)
                    {
                        Console.WriteLine("✓ Vikas user created successfully");
                        Console.WriteLine("  Email: vikas@gmail.com");
                        Console.WriteLine("  Password: Vikas123");
                    }
                    else
                    {
                        Console.WriteLine("✗ Failed to create Vikas user:");
                        foreach (var error in result.Errors)
                        {
                            Console.WriteLine($"  - {error.Description}");
                        }
                    }
                }
                else
                {
                    Console.WriteLine("✓ Vikas user already exists, resetting password to Vikas123");
                    var removePasswordResult = await userManager.RemovePasswordAsync(vikasUser);
                    var addPasswordResult = await userManager.AddPasswordAsync(vikasUser, "Vikas123");
                    if (addPasswordResult.Succeeded)
                    {
                        Console.WriteLine("✓ Vikas user password reset to Vikas123 successfully");
                    }
                    else
                    {
                        Console.WriteLine("✗ Failed to reset Vikas user password:");
                        foreach (var error in addPasswordResult.Errors)
                        {
                            Console.WriteLine($"  - {error.Description}");
                        }
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
