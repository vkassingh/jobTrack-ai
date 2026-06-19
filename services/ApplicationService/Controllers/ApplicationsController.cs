using JobTrackAI.ApplicationService.Data;
using JobTrackAI.ApplicationService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

namespace JobTrackAI.ApplicationService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/applications")]
    public class ApplicationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly HttpClient _httpClient;

        public ApplicationsController(ApplicationDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClient = httpClientFactory.CreateClient();
        }

        // GET: api/applications
        [HttpGet]
        public async Task<IActionResult> GetApplications()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Unable to identify user." });
            }

            var applications = await _context.JobApplications
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.DateApplied)
                .ToListAsync();

            return Ok(applications);
        }

        // GET: api/applications/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetApplication(Guid id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Unable to identify user." });
            }

            var application = await _context.JobApplications.FindAsync(id);
            if (application == null || application.UserId != userId)
            {
                return NotFound(new { message = "Application not found." });
            }

            return Ok(application);
        }

        // POST: api/applications
        [HttpPost]
        public async Task<IActionResult> CreateApplication([FromBody] CreateApplicationDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Unable to identify user." });
            }

            var application = new JobApplication
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Company = dto.Company.Trim(),
                Role = dto.Role.Trim(),
                Salary = dto.Salary?.Trim() ?? string.Empty,
                Status = dto.Status?.Trim() ?? "Wishlist",
                JobDescriptionUrl = dto.JobDescriptionUrl?.Trim() ?? string.Empty,
                Notes = dto.Notes?.Trim() ?? string.Empty,
                DateApplied = dto.DateApplied ?? DateTime.UtcNow
            };

            _context.JobApplications.Add(application);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetApplication), new { id = application.Id }, application);
        }

        // PUT: api/applications/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateApplication(Guid id, [FromBody] UpdateApplicationDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Unable to identify user." });
            }

            var application = await _context.JobApplications.FindAsync(id);
            if (application == null || application.UserId != userId)
            {
                return NotFound(new { message = "Application not found." });
            }

            application.Company = dto.Company.Trim();
            application.Role = dto.Role.Trim();
            application.Salary = dto.Salary?.Trim() ?? string.Empty;
            application.Status = dto.Status?.Trim() ?? application.Status;
            application.JobDescriptionUrl = dto.JobDescriptionUrl?.Trim() ?? string.Empty;
            application.Notes = dto.Notes?.Trim() ?? string.Empty;
            if (dto.DateApplied.HasValue)
            {
                application.DateApplied = dto.DateApplied.Value;
            }

            _context.Entry(application).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(application);
        }

        // DELETE: api/applications/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteApplication(Guid id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Unable to identify user." });
            }

            var application = await _context.JobApplications.FindAsync(id);
            if (application == null || application.UserId != userId)
            {
                return NotFound(new { message = "Application not found." });
            }

            _context.JobApplications.Remove(application);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Application deleted successfully." });
        }

        // GET: api/applications/discover
        [HttpGet("discover")]
        public async Task<IActionResult> DiscoverJobs([FromQuery] string? query, [FromQuery] string? source)
        {
            var jobsList = new List<DiscoverJobDto>();
            var requestedSource = source?.ToLower() ?? "all";

            var fetchRemoteOk = requestedSource == "all" || requestedSource == "remoteok";
            var fetchFakeJobs = requestedSource == "all" || requestedSource == "fakejobs";

            var tasks = new List<Task<List<DiscoverJobDto>>>();

            if (fetchRemoteOk)
            {
                tasks.Add(FetchRemoteOkJobsAsync());
            }

            if (fetchFakeJobs)
            {
                tasks.Add(FetchFakeJobsAsync());
            }

            try
            {
                var results = await Task.WhenAll(tasks);
                foreach (var result in results)
                {
                    jobsList.AddRange(result);
                }
            }
            catch (Exception ex)
            {
                // Log and gracefully continue if one of the feeds is transiently unavailable
                Console.WriteLine($"Error fetching external jobs: {ex.Message}");
            }

            // Apply text query filtering on backend
            if (!string.IsNullOrWhiteSpace(query))
            {
                var term = query.Trim().ToLower();
                jobsList = jobsList.Where(j => 
                    j.Company.ToLower().Contains(term) || 
                    j.Role.ToLower().Contains(term) || 
                    j.Description.ToLower().Contains(term) ||
                    j.Location.ToLower().Contains(term)
                ).ToList();
            }

            return Ok(jobsList);
        }

        private async Task<List<DiscoverJobDto>> FetchRemoteOkJobsAsync()
        {
            var jobs = new List<DiscoverJobDto>();
            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, "https://remoteok.com/api");
                
                // RemoteOK Cloudflare protection requires a standard browser User-Agent
                request.Headers.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
                request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                var response = await _httpClient.SendAsync(request);
                if (response.IsSuccessStatusCode)
                {
                    var jsonString = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(jsonString);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var element in doc.RootElement.EnumerateArray())
                        {
                            // Skip the legal disclaimer item
                            if (element.TryGetProperty("legal", out _)) continue;

                            var id = element.TryGetProperty("id", out var idProp) ? idProp.ToString() : Guid.NewGuid().ToString();
                            var company = element.TryGetProperty("company", out var compProp) ? compProp.GetString() ?? "" : "";
                            var position = element.TryGetProperty("position", out var posProp) ? posProp.GetString() ?? "" : "";
                            var description = element.TryGetProperty("description", out var descProp) ? descProp.GetString() ?? "" : "";
                            var url = element.TryGetProperty("url", out var urlProp) ? urlProp.GetString() ?? "" : "";
                            var location = element.TryGetProperty("location", out var locProp) ? locProp.GetString() ?? "" : "Remote";
                            var logo = element.TryGetProperty("logo", out var logoProp) ? logoProp.GetString() ?? "" : "";

                            var salary = "";
                            if (element.TryGetProperty("salary_min", out var minProp) && element.TryGetProperty("salary_max", out var maxProp))
                            {
                                salary = $"${minProp.ToString()} - ${maxProp.ToString()}";
                            }
                            else if (element.TryGetProperty("salary_min", out minProp))
                            {
                                salary = $"From ${minProp.ToString()}";
                            }

                            jobs.Add(new DiscoverJobDto
                            {
                                Id = $"remoteok-{id}",
                                Company = company,
                                Role = position,
                                Salary = salary,
                                Description = description,
                                JobUrl = url,
                                Source = "RemoteOK",
                                Location = location,
                                LogoUrl = logo
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"RemoteOK fetch exception: {ex.Message}");
            }
            return jobs;
        }

        private async Task<List<DiscoverJobDto>> FetchFakeJobsAsync()
        {
            var jobs = new List<DiscoverJobDto>();
            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, "https://fakejobs-api.vercel.app/jobs");
                request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                var response = await _httpClient.SendAsync(request);
                if (response.IsSuccessStatusCode)
                {
                    var jsonString = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(jsonString);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var element in doc.RootElement.EnumerateArray())
                        {
                            var id = element.TryGetProperty("id", out var idProp) ? idProp.ToString() : Guid.NewGuid().ToString();
                            var title = element.TryGetProperty("title", out var titleProp) ? titleProp.GetString() ?? "" : "";
                            var description = element.TryGetProperty("description", out var descProp) ? descProp.GetString() ?? "" : "";
                            var location = element.TryGetProperty("location", out var locProp) ? locProp.GetString() ?? "" : "";
                            var salary = element.TryGetProperty("salary", out var salProp) ? salProp.GetString() ?? "" : "";

                            var companyName = "";
                            if (element.TryGetProperty("company", out var compProp))
                            {
                                if (compProp.ValueKind == JsonValueKind.Object)
                                {
                                    companyName = compProp.TryGetProperty("name", out var nameProp) ? nameProp.GetString() ?? "" : "";
                                }
                                else if (compProp.ValueKind == JsonValueKind.String)
                                {
                                    companyName = compProp.GetString() ?? "";
                                }
                            }

                            jobs.Add(new DiscoverJobDto
                            {
                                Id = $"fakejobs-{id}",
                                Company = companyName,
                                Role = title,
                                Salary = salary,
                                Description = description,
                                JobUrl = $"https://fakejobs-api.vercel.app/jobs/{id}",
                                Source = "FakeJobs",
                                Location = location,
                                LogoUrl = ""
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"FakeJobs fetch exception: {ex.Message}");
            }
            return jobs;
        }
    }

    public class CreateApplicationDto
    {
        public string Company { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? Salary { get; set; }
        public string? Status { get; set; }
        public string? JobDescriptionUrl { get; set; }
        public string? Notes { get; set; }
        public DateTime? DateApplied { get; set; }
    }

    public class UpdateApplicationDto
    {
        public string Company { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? Salary { get; set; }
        public string? Status { get; set; }
        public string? JobDescriptionUrl { get; set; }
        public string? Notes { get; set; }
        public DateTime? DateApplied { get; set; }
    }

    public class DiscoverJobDto
    {
        public string Id { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Salary { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string JobUrl { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
    }
}
