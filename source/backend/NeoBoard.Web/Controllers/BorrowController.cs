using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeoBoard.Infrastructure.Data;
using NeoBoard.Domain.Entities;
using NeoBoard.Application.Common.Interfaces;
using Microsoft.AspNetCore.SignalR;
using NeoBoard.Web.Hubs;
using System;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

namespace NeoBoard.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class BorrowController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHashService _hashService;
        private readonly IFileService _fileService;
        private readonly IHubContext<NotificationHub> _hubContext;

        public BorrowController(
            AppDbContext context, 
            IHashService hashService,
            IFileService fileService,
            IHubContext<NotificationHub> hubContext)
        {
            this._context = context;
            this._hashService = hashService;
            this._fileService = fileService;
            this._hubContext = hubContext;
        }

        [HttpGet("Requests")]
        public async Task<IActionResult> GetRequests()
        {
            var requests = await _context.BorrowRequests
                .Include(r => r.Student)
                .Include(r => r.User)
                .Include(r => r.Items)
                    .ThenInclude(i => i.Asset)
                .Include(r => r.Items)
                    .ThenInclude(i => i.Toolset)
                .OrderByDescending(r => r.RequestDate)
                .ToListAsync();

            var result = requests.Select(r => new {
                id = r.Id.ToString(),
                assetName = r.Items.Any() 
                    ? string.Join(", ", r.Items.Select(i => i.Asset != null ? i.Asset.Name : (i.Toolset != null ? $"{i.Toolset.Name} (x{i.Quantity})" : "Thiết bị/Dụng cụ"))) 
                    : "Không có thiết bị",
                userName = r.Student != null ? r.Student.FullName : (r.User != null ? r.User.FullName : "Người dùng hệ thống"),
                requestDate = r.RequestDate.ToString("yyyy-MM-dd"),
                expectedReturnDate = r.ExpectedReturnDate.ToString("yyyy-MM-dd"),
                status = r.Status,
                reason = r.Purpose ?? "Không có lý do",
                totalQuantity = r.Items.Sum(i => i.Quantity),
                isLargeRequest = r.Items.Sum(i => i.Quantity) >= 4
            }).ToList();

            return Ok(result);
        }

        [HttpPost("{id}/Approve")]
        public async Task<IActionResult> ApproveRequest(Guid id)
        {
            var request = await _context.BorrowRequests.Include(r => r.Items).FirstOrDefaultAsync(r => r.Id == id);
            if (request == null) return NotFound();

            request.Status = "Approved";
            foreach (var item in request.Items)
            {
                if (item.AssetId.HasValue)
                {
                    var asset = await _context.Assets.FindAsync(item.AssetId.Value);
                    if (asset != null)
                    {
                        asset.Status = "InUse";
                    }
                }
            }

            await _context.SaveChangesAsync();

            // Notify Student via SignalR
            if (request.StudentId.HasValue)
            {
                await _hubContext.Clients.Group($"Users_{request.StudentId.Value}").SendAsync("ReceiveRequestStatusChanged", new {
                    requestId = request.Id.ToString(),
                    status = "Approved",
                    message = "🎉 Yêu cầu mượn của bạn đã được duyệt! Hãy đến quầy nhận thiết bị."
                });
            }

            return Ok(new { success = true });
        }

        [HttpPost("{id}/Reject")]
        public async Task<IActionResult> RejectRequest(Guid id)
        {
            var request = await _context.BorrowRequests.Include(r => r.Items).FirstOrDefaultAsync(r => r.Id == id);
            if (request == null) return NotFound();

            request.Status = "Rejected";

            // Trả lại số lượng khả dụng của Toolset nếu bị từ chối duyệt mượn
            foreach (var item in request.Items)
            {
                if (item.ToolsetId.HasValue)
                {
                    var toolset = await _context.Toolsets.FindAsync(item.ToolsetId.Value);
                    if (toolset != null)
                    {
                        toolset.AvailableQuantity += item.Quantity;
                        if (toolset.AvailableQuantity > toolset.TotalQuantity)
                        {
                            toolset.AvailableQuantity = toolset.TotalQuantity;
                        }
                        _context.Toolsets.Update(toolset);
                    }
                }
            }

            await _context.SaveChangesAsync();

            // Notify Student via SignalR
            if (request.StudentId.HasValue)
            {
                await _hubContext.Clients.Group($"Users_{request.StudentId.Value}").SendAsync("ReceiveRequestStatusChanged", new {
                    requestId = request.Id.ToString(),
                    status = "Rejected",
                    message = "❌ Yêu cầu mượn của bạn đã bị từ chối."
                });
            }

            return Ok(new { success = true });
        }

        [HttpGet("VerifyBlockchain")]
        public async Task<IActionResult> VerifyBlockchain()
        {
            var requests = await _context.BorrowRequests
                .Include(r => r.Student)
                .Include(r => r.User)
                .Include(r => r.Items)
                    .ThenInclude(i => i.Asset)
                .Include(r => r.Items)
                    .ThenInclude(i => i.Toolset)
                .OrderBy(r => r.RequestDate) // Chạy theo thứ tự thời gian tăng dần để kiểm tra liên kết
                .ToListAsync();

            // Auto-heal logic: Chỉ tự động cập nhật và điền các bản ghi cũ bị thiếu mã băm.
            // Nếu mã băm đã tồn tại nhưng không khớp (do có ai đó chỉnh sửa trực tiếp DB), hệ thống KHÔNG tự sửa
            // để đảm bảo Blockchain Auditor phát hiện được sự thay đổi trái phép này.
            bool needsUpdate = false;
            string currentExpectedPreviousHash = "00000000000000000000000000000000";
            foreach (var req in requests)
            {
                var studentCode = req.Student?.StudentCode ?? "USER";
                var assetIdsString = string.Join(",", req.Items
                    .Select(i => i.AssetId.HasValue 
                        ? i.AssetId.Value.ToString() 
                        : $"{i.ToolsetId.GetValueOrDefault()}:{i.Quantity}")
                    .OrderBy(s => s));

                var calculatedHash = _hashService.ComputeTransactionHash(
                    studentCode,
                    assetIdsString,
                    req.EvidencePhotoUrl ?? string.Empty,
                    req.PreviousHash ?? "00000000000000000000000000000000",
                    req.RequestDate
                );

                if (string.IsNullOrEmpty(req.TransactionHash) || string.IsNullOrEmpty(req.PreviousHash))
                {
                    req.PreviousHash = currentExpectedPreviousHash;
                    req.TransactionHash = calculatedHash;
                    _context.BorrowRequests.Update(req);
                    needsUpdate = true;
                }
                currentExpectedPreviousHash = req.TransactionHash ?? "00000000000000000000000000000000";
            }

            if (needsUpdate)
            {
                await _context.SaveChangesAsync();
                // Re-fetch to get clean state
                requests = await _context.BorrowRequests
                    .Include(r => r.Student)
                    .Include(r => r.User)
                    .Include(r => r.Items)
                        .ThenInclude(i => i.Asset)
                    .Include(r => r.Items)
                        .ThenInclude(i => i.Toolset)
                    .OrderBy(r => r.RequestDate)
                    .ToListAsync();
            }

            var blocks = new List<object>();
            bool isChainIntact = true;
            int invalidBlocksCount = 0;
            string expectedPreviousHash = "00000000000000000000000000000000";

            foreach (var req in requests)
            {
                // 1. Tính toán lại mã Hash của block hiện tại sử dụng định dạng băm chuẩn hóa
                var studentCode = req.Student?.StudentCode ?? "USER";
                var assetIdsString = string.Join(",", req.Items
                    .Select(i => i.AssetId.HasValue 
                        ? i.AssetId.Value.ToString() 
                        : $"{i.ToolsetId.GetValueOrDefault()}:{i.Quantity}")
                    .OrderBy(s => s));
                
                var calculatedHash = _hashService.ComputeTransactionHash(
                    studentCode,
                    assetIdsString,
                    req.EvidencePhotoUrl ?? string.Empty,
                    req.PreviousHash ?? "00000000000000000000000000000000",
                    req.RequestDate
                );

                // 2. Kiểm tra tính toàn vẹn của Hash hiện tại (StoredHash vs ComputedHash)
                bool isHashValid = req.TransactionHash == calculatedHash;

                // 3. Kiểm tra tính toàn vẹn của chuỗi (PreviousHash của khối này phải bằng hash thực tế của khối trước)
                bool isChainValid = req.PreviousHash == expectedPreviousHash;

                if (!isHashValid || !isChainValid)
                {
                    isChainIntact = false;
                    invalidBlocksCount++;
                }

                // Cập nhật expected hash cho khối tiếp theo
                expectedPreviousHash = req.TransactionHash ?? "00000000000000000000000000000000";

                blocks.Add(new {
                    id = req.Id.ToString(),
                    studentCode = studentCode,
                    studentName = req.Student?.FullName ?? (req.User?.FullName ?? "Hệ thống"),
                    itemCount = req.Items.Count,
                    itemsSummary = req.Items.Any() 
                        ? string.Join(", ", req.Items.Select(i => i.Asset != null ? i.Asset.Name : (i.Toolset != null ? $"{i.Toolset.Name} (x{i.Quantity})" : "Thiết bị/Dụng cụ"))) 
                        : "Không có thiết bị",
                    requestDate = req.RequestDate,
                    previousHash = req.PreviousHash ?? "00000000000000000000000000000000",
                    storedHash = req.TransactionHash ?? string.Empty,
                    computedHash = calculatedHash,
                    isHashValid = isHashValid,
                    isChainValid = isChainValid
                });
            }

            // Đảo ngược danh sách để hiển thị khối mới nhất lên đầu
            blocks.Reverse();

            return Ok(new {
                isChainIntact = isChainIntact,
                totalBlocks = requests.Count,
                invalidBlocksCount = invalidBlocksCount,
                blocks = blocks
            });
        }

        [HttpGet("MyRequests/{userId}")]
        public async Task<IActionResult> GetMyRequests(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            string userEmail = user?.Email ?? "";

            Guid? studentId = null;
            if (!string.IsNullOrEmpty(userEmail))
            {
                var student = await _context.Students.FirstOrDefaultAsync(s => s.Email == userEmail);
                if (student != null)
                {
                    studentId = student.Id;
                }
            }

            var requests = await _context.BorrowRequests
                .Where(r => r.UserId == userId 
                         || r.StudentId == userId 
                         || (studentId.HasValue && r.StudentId == studentId.Value))
                .Include(r => r.Items)
                .ThenInclude(i => i.Asset)
                .OrderByDescending(r => r.RequestDate)
                .ToListAsync();
            return Ok(requests);
        }

        [HttpGet("StudentPortalSummary/{studentCode}")]
        public async Task<IActionResult> GetStudentPortalSummary(string studentCode)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.StudentCode.ToLower() == studentCode.ToLower());
            if (student == null) return NotFound(new { success = false, message = "Không tìm thấy sinh viên." });

            var requests = await _context.BorrowRequests
                .Where(r => r.StudentId == student.Id)
                .Include(r => r.Items)
                    .ThenInclude(i => i.Asset)
                .Include(r => r.Items)
                    .ThenInclude(i => i.Toolset)
                .OrderByDescending(r => r.RequestDate)
                .ToListAsync();

            var activeItems = requests
                .Where(r => r.Status == "Approved" || r.Status == "Overdue")
                .SelectMany(r => r.Items)
                .Where(i => i.ActualReturnDate == null)
                .Select(i => new {
                    itemId = i.Id,
                    requestId = i.BorrowRequestId,
                    assetId = i.AssetId,
                    toolsetId = i.ToolsetId,
                    assetName = i.Asset != null 
                        ? i.Asset.Name 
                        : (i.Toolset != null ? $"{i.Toolset.Name} (x{i.Quantity})" : "N/A"),
                    serialNumber = i.Asset != null ? i.Asset.SerialNumber : "N/A",
                    type = i.Asset != null ? i.Asset.Type : "Bộ dụng cụ",
                    expectedReturnDate = i.BorrowRequest != null ? i.BorrowRequest.ExpectedReturnDate : DateTime.MinValue,
                })
                .ToList();

            var pendingRequests = requests
                .Where(r => r.Status == "Pending")
                .Select(r => new {
                    id = r.Id,
                    requestDate = r.RequestDate,
                    expectedReturnDate = r.ExpectedReturnDate,
                    purpose = r.Purpose,
                    itemCount = r.Items.Count,
                    assets = r.Items.Select(i => new {
                        id = i.AssetId,
                        name = i.Asset != null ? i.Asset.Name : "N/A",
                        serialNumber = i.Asset != null ? i.Asset.SerialNumber : "N/A",
                        type = i.Asset != null ? i.Asset.Type : "N/A"
                    })
                })
                .ToList();

            return Ok(new {
                student = new {
                    id = student.Id,
                    studentCode = student.StudentCode,
                    fullName = student.FullName,
                    email = student.Email,
                    phoneNumber = "N/A",
                    department = student.Department
                },
                activeItems = activeItems,
                pendingRequests = pendingRequests
            });
        }

        [HttpPost("create-request")]
        public async Task<IActionResult> CreateRequest([FromBody] CreateBorrowRequestModel model)
        {
            // 1. Kiểm tra sinh viên
            var student = await _context.Students.FindAsync(model.StudentId);
            if (student == null)
            {
                // Fallback cho nhà phát triển/kiểm thử khi đăng nhập bằng Admin/Staff
                student = await _context.Students.FirstOrDefaultAsync(s => s.StudentCode == "SV1001")
                          ?? await _context.Students.FirstOrDefaultAsync();
                
                if (student == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy sinh viên nào trong hệ thống." });
                }
            }

            // 2. Lưu ảnh Selfie thật vào ổ đĩa
            string photoUrl = string.Empty;
            if (!string.IsNullOrEmpty(model.EvidencePhoto))
            {
                photoUrl = await _fileService.SaveBase64ImageAsync(model.EvidencePhoto, "selfies");
            }

            // 3. Lấy hash của giao dịch gần nhất (Blockchain-lite)
            var lastTransaction = await _context.BorrowRequests
                .OrderByDescending(r => r.RequestDate)
                .FirstOrDefaultAsync();
            string previousHash = lastTransaction?.TransactionHash ?? "00000000000000000000000000000000";

            // 4. Tạo request mới
            var borrowRequest = new BorrowRequest
            {
                Id = Guid.NewGuid(),
                UserId = Guid.Parse("00000000-0000-0000-0000-000000000001"), // Admin mặc định duyệt
                StudentId = student.Id,
                RequestDate = DateTime.UtcNow,
                ExpectedReturnDate = model.ExpectedReturnDate,
                Purpose = model.Purpose,
                Status = "Pending", // Đơn đăng ký mượn mới ở trạng thái chờ duyệt
                EvidencePhotoUrl = photoUrl,
                PreviousHash = previousHash
            };

            // 5. Tính toán hash cho giao dịch này (kết hợp cả Thiết bị lẻ và Bộ dụng cụ)
            var itemIdsList = model.AssetIds.Select(id => id.ToString()).ToList();
            if (model.ToolsetItems != null)
            {
                itemIdsList.AddRange(model.ToolsetItems.Select(ti => $"{ti.ToolsetId}:{ti.Quantity}"));
            }
            string itemsHashString = string.Join(",", itemIdsList.OrderBy(s => s));

            borrowRequest.TransactionHash = _hashService.ComputeTransactionHash(
                student.StudentCode, 
                itemsHashString, 
                borrowRequest.EvidencePhotoUrl, 
                previousHash,
                borrowRequest.RequestDate
            );

            // 6. Thêm các thiết bị lẻ (Assets)
            foreach (var assetId in model.AssetIds)
            {
                var asset = await _context.Assets.FindAsync(assetId);
                if (asset != null)
                {
                    borrowRequest.Items.Add(new BorrowItem
                    {
                        Id = Guid.NewGuid(),
                        AssetId = assetId,
                        ConditionOnBorrow = "Tốt (Xác nhận tại quầy)",
                        Quantity = 1
                    });
                }
            }

            // 7. Thêm các bộ dụng cụ thực hành (Toolsets)
            if (model.ToolsetItems != null)
            {
                foreach (var toolsetItem in model.ToolsetItems)
                {
                    var toolset = await _context.Toolsets.FindAsync(toolsetItem.ToolsetId);
                    if (toolset != null)
                    {
                        // Kiểm tra số lượng khả dụng
                        if (toolset.AvailableQuantity < toolsetItem.Quantity)
                        {
                            return BadRequest(new { 
                                success = false, 
                                message = $"Số lượng khả dụng của bộ dụng cụ '{toolset.Name}' không đủ (Chỉ còn {toolset.AvailableQuantity} bộ)." 
                            });
                        }

                        // Giảm số lượng khả dụng trong kho
                        toolset.AvailableQuantity -= toolsetItem.Quantity;
                        _context.Toolsets.Update(toolset);

                        borrowRequest.Items.Add(new BorrowItem
                        {
                            Id = Guid.NewGuid(),
                            ToolsetId = toolsetItem.ToolsetId,
                            ConditionOnBorrow = "Tốt (Xác nhận tại quầy)",
                            Quantity = toolsetItem.Quantity
                        });
                    }
                }
            }

            _context.BorrowRequests.Add(borrowRequest);
            await _context.SaveChangesAsync();

            // Notify Admins and Staffs via SignalR
            try
            {
                var totalQty = borrowRequest.Items.Sum(i => i.Quantity);
                var isLarge = totalQty >= 4;
                var payload = new {
                    requestId = borrowRequest.Id.ToString(),
                    studentName = student.FullName,
                    studentCode = student.StudentCode,
                    totalQuantity = totalQty,
                    isLargeRequest = isLarge,
                    assetNames = string.Join(", ", borrowRequest.Items.Select(i => i.Asset != null ? i.Asset.Name : (i.Toolset != null ? $"{i.Toolset.Name} (x{i.Quantity})" : "Thiết bị")))
                };
                
                await _hubContext.Clients.Group("Admins").SendAsync("ReceiveNewRequest", payload);
                await _hubContext.Clients.Group("Staffs").SendAsync("ReceiveNewRequest", payload);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SignalR broadcast error: {ex.Message}");
            }

            return Ok(new { 
                success = true, 
                message = "Giao dịch thành công! Ảnh minh chứng và mã Hash đã được lưu vết.",
                transactionHash = borrowRequest.TransactionHash,
                previousHash = borrowRequest.PreviousHash,
                photoUrl = borrowRequest.EvidencePhotoUrl
            });
        }

        public class CreateBorrowRequestModel
        {
            public Guid StudentId { get; set; }
            public DateTime ExpectedReturnDate { get; set; }
            public Guid[] AssetIds { get; set; } = Array.Empty<Guid>();
            public List<BorrowItemInputModel> ToolsetItems { get; set; } = new();
            public string? EvidencePhoto { get; set; } // Base64
            public string? Purpose { get; set; }
        }

        public class BorrowItemInputModel
        {
            public Guid ToolsetId { get; set; }
            public int Quantity { get; set; }
        }

        public class ReturnItemModel
        {
            public string Condition { get; set; } = "Tốt";
        }

        [HttpPost("Return/{itemId}")]
        public async Task<IActionResult> ReturnItem(Guid itemId, [FromBody] ReturnItemModel model)
        {
            var item = await _context.BorrowItems.FindAsync(itemId);
            if (item == null) return NotFound();

            item.ActualReturnDate = DateTime.UtcNow;
            item.ConditionOnReturn = model.Condition ?? "Tốt";

            var request = await _context.BorrowRequests
                .Include(r => r.Student)
                .Include(r => r.Items)
                .FirstOrDefaultAsync(r => r.Id == item.BorrowRequestId);

            // Trả lại thiết bị về trạng thái Active
            if (item.AssetId.HasValue)
            {
                var asset = await _context.Assets.FindAsync(item.AssetId.Value);
                if (asset != null)
                {
                    // Nếu tình trạng là báo mất đền bù
                    if (model.Condition != null && model.Condition.Contains("Báo mất"))
                    {
                        asset.Status = "Broken"; // Khóa thiết bị

                        var health = await _context.AssetHealths.FirstOrDefaultAsync(h => h.AssetId == asset.Id);
                        if (health != null)
                        {
                            health.HealthStatus = "Critical";
                            health.HealthNotes = $"[Báo mất] Đã mất bởi sinh viên. Chi tiết đền bù đang được xử lý.";
                            _context.AssetHealths.Update(health);
                        }
                        
                        string compensationPrice = asset.Price.HasValue 
                            ? asset.Price.Value.ToString("N0") + " VNĐ" 
                            : "Không rõ giá trị";

                        string lostNote = $"[Báo mất] Thiết bị [{asset.Name}] (S/N: {asset.SerialNumber}) bị mất bởi sinh viên {(request?.Student != null ? request.Student.FullName : "N/A")} (MSSV: {request?.Student?.StudentCode ?? "N/A"}). Đền bù ước tính: {compensationPrice}.";
                        
                        if (request != null)
                        {
                            request.Note = string.IsNullOrEmpty(request.Note) 
                                ? lostNote 
                                : request.Note + " | " + lostNote;
                        }
                    }
                    // Nếu tình trạng trả không tốt (ví dụ: Hỏng), đổi trạng thái thiết bị thành Broken
                    else if (model.Condition != null && (model.Condition.Contains("Hỏng") || model.Condition.Contains("Lỗi")))
                    {
                        asset.Status = "Broken";

                        var health = await _context.AssetHealths.FirstOrDefaultAsync(h => h.AssetId == asset.Id);
                        if (health != null)
                        {
                            health.HealthStatus = "Critical";
                            health.HealthNotes = $"[Tự động] Phát hiện hỏng hóc sau khi sinh viên trả thiết bị: {model.Condition}.";
                            _context.AssetHealths.Update(health);
                        }

                        // Tự động tạo phiếu bảo trì (Maintenance Ticket) cho thiết bị hỏng hóc để tăng tính minh bạch
                        var ticket = new MaintenanceTicket
                        {
                            Id = Guid.NewGuid(),
                            AssetId = asset.Id,
                            Description = $"[Tự động tạo] Khắc phục hỏng hóc sau khi sinh viên trả thiết bị. Tình trạng trả: {model.Condition}. Thiết bị: {asset.Name} ({asset.SerialNumber}).",
                            Status = "Assigned",
                            ScheduledDate = DateTime.UtcNow,
                            TotalCost = 0,
                            Notes = $"Liên kết đơn mượn ID: {item.BorrowRequestId}. Sinh viên mượn: {(request?.Student != null ? request.Student.FullName : "N/A")} ({request?.Student?.StudentCode ?? "N/A"})."
                        };
                        _context.MaintenanceTickets.Add(ticket);

                        string damageNote = $"[Hư hỏng] Thiết bị [{asset.Name}] bị trả hỏng với tình trạng: {model.Condition}. Đã tự động tạo phiếu sửa chữa.";
                        if (request != null)
                        {
                            request.Note = string.IsNullOrEmpty(request.Note)
                                ? damageNote
                                : request.Note + " | " + damageNote;
                        }
                    }
                    else
                    {
                        asset.Status = "Active";

                        var health = await _context.AssetHealths.FirstOrDefaultAsync(h => h.AssetId == asset.Id);
                        if (health != null)
                        {
                            health.HealthStatus = "Good";
                            health.HealthNotes = "Hoạt động bình thường.";
                            _context.AssetHealths.Update(health);
                        }
                    }
                }
            }

            // Trả lại số lượng bộ dụng cụ thực hành về kho
            if (item.ToolsetId.HasValue)
            {
                var toolset = await _context.Toolsets.FindAsync(item.ToolsetId.Value);
                if (toolset != null)
                {
                    toolset.AvailableQuantity += item.Quantity;
                    if (toolset.AvailableQuantity > toolset.TotalQuantity)
                    {
                        toolset.AvailableQuantity = toolset.TotalQuantity;
                    }
                    _context.Toolsets.Update(toolset);
                }
            }

            if (request != null && request.Items.All(i => i.ActualReturnDate.HasValue))
            {
                request.Status = "Returned";
            }

            await _context.SaveChangesAsync();

            // Notify Student via SignalR
            try
            {
                if (request != null && request.StudentId.HasValue)
                {
                    var itemName = item.Asset != null ? item.Asset.Name : (item.Toolset != null ? item.Toolset.Name : "Thiết bị");
                    await _hubContext.Clients.Group($"Users_{request.StudentId.Value}").SendAsync("ReceiveReturnConfirmation", new {
                        itemId = item.Id.ToString(),
                        itemName = itemName,
                        message = $"✅ Đã ghi nhận trả thiết bị [{itemName}] thành công."
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SignalR return notification error: {ex.Message}");
            }

            return Ok(new { success = true, message = "Đã ghi nhận trả thiết bị!" });
        }
    }
}
