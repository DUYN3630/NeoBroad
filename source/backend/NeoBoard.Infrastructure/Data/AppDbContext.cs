using Microsoft.EntityFrameworkCore;
using NeoBoard.Domain.Entities;
using System.Linq;

namespace NeoBoard.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<Asset> Assets { get; set; }
        public virtual DbSet<Toolset> Toolsets { get; set; }
        public virtual DbSet<BorrowRequest> BorrowRequests { get; set; }
        public virtual DbSet<BorrowItem> BorrowItems { get; set; }
        public virtual DbSet<RefreshToken> RefreshTokens { get; set; }
        public virtual DbSet<TimelinePost> TimelinePosts { get; set; }
        public virtual DbSet<PostComment> PostComments { get; set; }
        public virtual DbSet<Announcement> Announcements { get; set; }
        public virtual DbSet<AnnouncementRead> AnnouncementReads { get; set; }
        public virtual DbSet<Survey> Surveys { get; set; }
        public virtual DbSet<SurveyQuestion> SurveyQuestions { get; set; }
        public virtual DbSet<SurveyResponse> SurveyResponses { get; set; }
        public virtual DbSet<Notification> Notifications { get; set; }
        public virtual DbSet<FileAttachment> FileAttachments { get; set; }
        public virtual DbSet<UserActivity> UserActivities { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Tự động chuyển tất cả tên bảng và tên cột sang lowercase cho PostgreSQL
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                // Đổi tên bảng
                entity.SetTableName(entity.GetTableName()?.ToLower());

                // Đổi tên cột
                foreach (var property in entity.GetProperties())
                {
                    property.SetColumnName(property.Name.ToLower());
                }

                // Đổi tên các ràng buộc (Keys, Foreign Keys, Indexes)
                foreach (var key in entity.GetKeys())
                {
                    key.SetName(key.GetName()?.ToLower());
                }
                foreach (var fk in entity.GetForeignKeys())
                {
                    fk.SetConstraintName(fk.GetConstraintName()?.ToLower());
                }
                foreach (var index in entity.GetIndexes())
                {
                    index.SetDatabaseName(index.GetDatabaseName()?.ToLower());
                }
            }

            // Cấu hình Quan hệ đặc thù nếu cần
            modelBuilder.Entity<BorrowRequest>(e => {
                e.HasOne(d => d.User).WithMany().HasForeignKey(d => d.UserId);
                e.HasOne(d => d.ApprovedBy).WithMany().HasForeignKey(d => d.ApprovedById).OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<BorrowItem>(e => {
                e.HasOne(d => d.BorrowRequest).WithMany(p => p.Items).HasForeignKey(d => d.BorrowRequestId);
                e.HasOne(d => d.Asset).WithMany(p => p.BorrowItems).HasForeignKey(d => d.AssetId).OnDelete(DeleteBehavior.SetNull);
                e.HasOne(d => d.Toolset).WithMany(p => p.BorrowItems).HasForeignKey(d => d.ToolsetId).OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}
