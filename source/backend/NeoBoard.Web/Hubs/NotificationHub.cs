using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace NeoBoard.Web.Hubs
{
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var roleQuery = httpContext?.Request.Query["role"].ToString();
            var userIdQuery = httpContext?.Request.Query["userId"].ToString();

            if (!string.IsNullOrEmpty(roleQuery))
            {
                // Role: 0 - Admin, 1 - Staff
                if (roleQuery == "0")
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
                }
                else if (roleQuery == "1")
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, "Staffs");
                }
            }

            if (!string.IsNullOrEmpty(userIdQuery))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"Users_{userIdQuery}");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}
