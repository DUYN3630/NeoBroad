using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace NeoBoard.Web.Middlewares
{
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;

        public SecurityHeadersMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Clickjacking Protection
            context.Response.Headers.Append("X-Frame-Options", "DENY");

            // MIME-type sniffing protection
            context.Response.Headers.Append("X-Content-Type-Options", "nosniff");

            // Cross-site scripting protection
            context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");

            // Referrer policy
            context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

            // Content Security Policy (Basic default policy)
            context.Response.Headers.Append("Content-Security-Policy", 
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://apis.google.com https://www.google.com; " +
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                "font-src 'self' data: https://fonts.gstatic.com; " +
                "img-src 'self' data: blob: *; " +
                "connect-src 'self' ws: wss: http://localhost:* https://*.googleapis.com https://identitytoolkit.googleapis.com https://neoboard.onrender.com https://neo-broad.vercel.app; " +
                "frame-src 'self' https://www.google.com; " +
                "media-src 'self';");

            await _next(context);
        }
    }
}
