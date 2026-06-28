using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NeoBoard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPhoneAndMfa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "isphoneverified",
                table: "users",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "phonenumber",
                table: "users",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "isphoneverified",
                table: "users");

            migrationBuilder.DropColumn(
                name: "phonenumber",
                table: "users");
        }
    }
}
