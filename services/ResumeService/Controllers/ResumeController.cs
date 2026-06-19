using JobTrackAI.ResumeService.Data;
using JobTrackAI.ResumeService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using UglyToad.PdfPig;

namespace JobTrackAI.ResumeService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/resumes")]
    public class ResumeController : ControllerBase
    {
        private readonly ResumeDbContext _context;
        private readonly string _uploadDirectory;

        public ResumeController(ResumeDbContext context)
        {
            _context = context;
            _uploadDirectory = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "resumes");
            if (!Directory.Exists(_uploadDirectory))
            {
                Directory.CreateDirectory(_uploadDirectory);
            }
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadResume(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded." });
            }

            if (Path.GetExtension(file.FileName).ToLower() != ".pdf")
            {
                return BadRequest(new { message = "Only PDF files are supported." });
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Unable to identify user." });
            }

            try
            {
                // Unique filename to prevent collision
                var fileId = Guid.NewGuid();
                var fileExtension = Path.GetExtension(file.FileName);
                var storageFileName = $"{fileId}{fileExtension}";
                var storageFilePath = Path.Combine(_uploadDirectory, storageFileName);

                // Save to local disk
                using (var stream = new FileStream(storageFilePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Extract text using PdfPig
                var parsedTextBuilder = new StringBuilder();
                using (var pdf = PdfDocument.Open(storageFilePath))
                {
                    foreach (var page in pdf.GetPages())
                    {
                        parsedTextBuilder.Append(page.Text);
                        parsedTextBuilder.Append(" ");
                    }
                }

                var parsedText = parsedTextBuilder.ToString().Trim();

                // Save metadata to DB
                var resume = new Resume
                {
                    Id = fileId,
                    UserId = userId,
                    FileName = file.FileName,
                    FilePath = storageFilePath,
                    UploadDate = DateTime.UtcNow,
                    ParsedText = parsedText
                };

                _context.Resumes.Add(resume);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = resume.Id,
                    fileName = resume.FileName,
                    uploadDate = resume.UploadDate,
                    parsedTextLength = parsedText.Length
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error uploading resume: {ex.Message}" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetResumes()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Unable to identify user." });
            }

            var resumes = await _context.Resumes
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.UploadDate)
                .Select(r => new
                {
                    id = r.Id,
                    fileName = r.FileName,
                    uploadDate = r.UploadDate,
                    parsedTextLength = r.ParsedText.Length
                })
                .ToListAsync();

            return Ok(resumes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetResume(Guid id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Unable to identify user." });
            }

            var resume = await _context.Resumes.FindAsync(id);
            if (resume == null || resume.UserId != userId)
            {
                return NotFound(new { message = "Resume not found." });
            }

            return Ok(new
            {
                id = resume.Id,
                fileName = resume.FileName,
                uploadDate = resume.UploadDate,
                parsedText = resume.ParsedText
            });
        }

        [HttpGet("download/{id}")]
        public async Task<IActionResult> DownloadResume(Guid id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Unable to identify user." });
            }

            var resume = await _context.Resumes.FindAsync(id);
            if (resume == null || resume.UserId != userId)
            {
                return NotFound(new { message = "Resume not found." });
            }

            if (!System.IO.File.Exists(resume.FilePath))
            {
                return NotFound(new { message = "Physical resume file not found on server." });
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(resume.FilePath);
            return File(fileBytes, "application/pdf", resume.FileName);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteResume(Guid id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Unable to identify user." });
            }

            var resume = await _context.Resumes.FindAsync(id);
            if (resume == null || resume.UserId != userId)
            {
                return NotFound(new { message = "Resume not found." });
            }

            try
            {
                // Delete physical file
                if (System.IO.File.Exists(resume.FilePath))
                {
                    System.IO.File.Delete(resume.FilePath);
                }

                // Delete DB record
                _context.Resumes.Remove(resume);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Resume deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error deleting resume: {ex.Message}" });
            }
        }
    }
}
